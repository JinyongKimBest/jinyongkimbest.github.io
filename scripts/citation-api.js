// scripts/citation-api.js
// Free-only, OpenAlex 전용 + DOI/ID 캐시 → 더 신선하고 안정적인 인용수.
// 캐시: assets/citation_cache.json
// 출력: assets/citation.json

const fs = require("fs");
const path = require("path");

// ---- 설정 ----
const TARGET_TITLES = [
  "Effect of Curvature of the Electrodes on the Electrochemical Behavior of Li-Ion Batteries",
  "Accelerating Simulations of Li-ion Battery Thermal Runaway Using Modified Patankar–Runge–Kutta Approach",
  "A robust numerical treatment of solid-phase diffusion in pseudo two-dimensional lithium-ion battery models",
  "A Comprehensive Numerical and Experimental Study for the Passive Thermal Management in Battery Modules and Packs",
  "Modeling cell venting and gas-phase reactions in 18650 lithium ion batteries during thermal runaway",
  "Transport Processes in a Li-ion Cell during an Internal Short-Circuit",
  "Modeling Extreme Deformations in Lithium-ion Batteries",
  "Two-dimensional modeling for physical processes in direct flame fuel cells",
  "A multipoint voltage-monitoring method for fuel cell inconsistency analysis",
  "Modeling liquid water re-distribution in bi-porous layer flow-fields of proton exchange membrane fuel cells",
  "Modeling two-phase flow in three-dimensional complex flow-fields of proton exchange membrane fuel cells",
];

// 예의상 메일(선택). 비워도 됨.
const MAILTO = process.env.MAILTO || "";

// 허용 도메인(비용 세이프)
const ALLOWLIST = ["https://api.openalex.org/"];

// 파일 경로
const OUT_JSON = path.join("assets", "citation.json");
const CACHE_JSON = path.join("assets", "citation_cache.json");

// ---- 유틸 ----
function norm(s) {
  return (s || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "");
}
function tokenScore(a, b) {
  const A = new Set(a.match(/[a-z0-9]+/g) || []);
  const B = new Set(b.match(/[a-z0-9]+/g) || []);
  const inter = [...A].filter(t => B.has(t)).length;
  const uni = new Set([...A, ...B]).size || 1;
  return inter / uni;
}
function inAllowlist(url) {
  return ALLOWLIST.some(prefix => url.startsWith(prefix));
}
async function jget(url) {
  if (!inAllowlist(url)) throw new Error(`blocked_url: ${url}`);
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if ([401,402,403].includes(r.status)) throw new Error(`paid_or_blocked: ${r.status} ${url}`);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.json();
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---- 캐시 ----
function loadCache() {
  if (fs.existsSync(CACHE_JSON)) {
    try { return JSON.parse(fs.readFileSync(CACHE_JSON, "utf-8")); } catch {}
  }
  return { updated_at: null, map: {} }; // map[norm(title)] = { openalex_id, doi, matched }
}
function saveCache(cache) {
  fs.mkdirSync(path.dirname(CACHE_JSON), { recursive: true });
  fs.writeFileSync(CACHE_JSON, JSON.stringify({ ...cache, updated_at: new Date().toISOString() }, null, 2), "utf-8");
}
function loadPrevOut() {
  if (fs.existsSync(OUT_JSON)) {
    try { return JSON.parse(fs.readFileSync(OUT_JSON, "utf-8")); } catch {}
  }
  return null;
}

// ---- OpenAlex ----
// 1) ID로 바로 조회(가장 정확)
async function getWorkById(oaid) {
  const m = MAILTO ? `&mailto=${encodeURIComponent(MAILTO)}` : "";
  const url = `https://api.openalex.org/works/${encodeURIComponent(oaid)}?select=display_name,ids,cited_by_count${m}`;
  return jget(url);
}
// 2) 제목 검색 → 최적 매칭 선택
async function searchWorkByTitle(title) {
  const q = encodeURIComponent(title);
  const m = MAILTO ? `&mailto=${encodeURIComponent(MAILTO)}` : "";
  const url = `https://api.openalex.org/works?search=${q}&per_page=10${m}`;
  const data = await jget(url);
  const results = data.results || [];
  const key = norm(title);
  let best=null, score=-1;
  for (const r of results) {
    const name = r.display_name || r.title || "";
    const n = norm(name);
    const s = (n===key)?1: (n.includes(key)||key.includes(n))?0.95: tokenScore(n,key);
    if (s>score) { score=s; best=r; }
  }
  if (!best) return null;
  // ID/DOI 추출
  const oaid = best.id || best.openalex || best.ids?.openalex || null; // e.g. "https://openalex.org/Wxxxx"
  const id = oaid ? oaid.split("/").pop() : null; // "Wxxxx"
  const doi = best.doi ? best.doi.replace(/^https?:\/\/doi.org\//,'')
              : (best.ids && best.ids.doi ? best.ids.doi.replace(/^https?:\/\/doi.org\//,'') : null);
  return { id, doi, matched: best.display_name || "", score };
}

(async function main(){
  try {
    const cache = loadCache();
    const prev = loadPrevOut();
    const prevMap = {};
    if (prev && Array.isArray(prev.items)) {
      for (const it of prev.items) prevMap[norm(it.title)] = (typeof it.citations==="number" ? it.citations : null);
    }

    const items = [];
    let total = 0;
    let cacheTouched = false;

    for (const t of TARGET_TITLES) {
      const key = norm(t);

      // 1) 캐시된 ID/DOI 사용
      let entry = cache.map[key] || null;

      // 2) 없으면 검색해서 캐시에 저장
      if (!entry || !entry.openalex_id) {
        const found = await searchWorkByTitle(t);
        if (found && found.id) {
          entry = { openalex_id: found.id, doi: found.doi || null, matched: found.matched || "", score: Number(found.score.toFixed(3)) };
          cache.map[key] = entry;
          cacheTouched = true;
          await sleep(200);
        }
      }

      // 3) ID로 최신 인용수 조회
      let citations = null, meta = null;
      if (entry && entry.openalex_id) {
        try {
          const w = await getWorkById(entry.openalex_id);
          const c = (typeof w.cited_by_count === "number") ? w.cited_by_count : null;
          citations = c;
          meta = { source: "openalex", matched: w.display_name || entry.matched || "", score: entry.score || null };
        } catch (e) {
          // 일시 오류 시 이전 값 유지
        }
      }

      // 4) 이전 값과 역전 방지(신규 값이 더 작으면 이전 값 유지)
      let finalC = citations;
      const prevC = prevMap[key];
      if (typeof prevC === "number" && (finalC == null || finalC < prevC)) {
        finalC = prevC;
      }

      items.push({
        title: t,
        citations: finalC,
        _src: meta ? meta.source : (typeof prevC==="number" ? "prev" : null),
        _matched: meta ? meta.matched : (cache.map[key]?.matched || null),
        _score: meta ? meta.score : (cache.map[key]?.score || null),
        _id: cache.map[key]?.openalex_id || null,
        _doi: cache.map[key]?.doi || null,
      });

      if (typeof finalC === "number") total += finalC;

      await sleep(150);
    }

    if (cacheTouched) saveCache(cache);

    const out = {
      updated_at: new Date().toISOString(),
      source_chain: ["openalex(id)"],
      total,
      items
    };

    fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
    fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2), "utf-8");
    console.log("Wrote", OUT_JSON, "total:", total);
  } catch (e) {
    console.error(e.stack || e.message || String(e));
    process.exit(1);
  }
})();
