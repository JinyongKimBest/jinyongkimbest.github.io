// Node 20+ (global fetch OK)
// ✅ 비용세이프: 유료/키 기반 API 호출 없음. 허용 도메인만 요청.
// ✅ 만약 제공처가 유료화되어 402/403/키요구를 내면 즉시 중단하고 이전 JSON 유지.
// 결과: /assets/citation.json

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

// 예의상 메일(옵션). 넣기 싫으면 빈 문자열로 두면 됨.
const MAILTO = process.env.MAILTO || "";

// 허용 도메인 화이트리스트(이 외로 나가면 즉시 에러)
const ALLOWLIST = [
  "https://api.openalex.org/",
  "https://api.crossref.org/",
  "https://opencitations.net/",
];

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
  if (!inAllowlist(url)) {
    throw new Error(`blocked_url: ${url}`);
  }
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  // 비용/키 요구 신호: 401/402/403 → 즉시 중단
  if ([401, 402, 403].includes(r.status)) {
    throw new Error(`paid_or_blocked: ${r.status} ${url}`);
  }
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.json();
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

function readPrevJSON() {
  const p = path.join("assets", "citation.json");
  if (fs.existsSync(p)) {
    try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch {}
  }
  return null;
}

// ---- 무료 제공처 1: OpenAlex ----
async function lookupOpenAlex(title) {
  const q = encodeURIComponent(title);
  const m = MAILTO ? `&mailto=${encodeURIComponent(MAILTO)}` : "";
  const url = `https://api.openalex.org/works?search=${q}&per_page=5${m}`;
  const data = await jget(url);
  const results = data.results || [];

  const key = norm(title);
  let best=null, score=-1;
  for (const r of results) {
    const name = r.display_name || r.title || "";
    const n = norm(name);
    const s = (n===key)?1:(n.includes(key)||key.includes(n))?0.9:tokenScore(n,key);
    if (s>score) { score=s; best=r; }
  }
  if (!best) return null;

  // citations가 null이면 나중 Crossref/OC로 보완
  return {
    source: "openalex",
    matched: best.display_name || "",
    score,
    citations: (typeof best.cited_by_count === "number") ? best.cited_by_count : null,
    doi: best.doi ? best.doi.replace(/^https?:\/\/doi.org\//,'')
        : (best.ids && best.ids.doi ? best.ids.doi.replace(/^https?:\/\/doi.org\//,'') : null)
  };
}

// ---- 무료 제공처 2: Crossref ----
async function lookupCrossref(title) {
  const q = encodeURIComponent(title);
  const m = MAILTO ? `&mailto=${encodeURIComponent(MAILTO)}` : "";
  const url = `https://api.crossref.org/works?query.title=${q}&rows=5${m}`;
  const data = await jget(url);
  const items = (data.message && data.message.items) || [];

  const key = norm(title);
  let best=null, score=-1;
  for (const it of items) {
    const name = (Array.isArray(it.title) && it.title[0]) || it.title || "";
    const n = norm(name);
    const s = (n===key)?1:(n.includes(key)||key.includes(n))?0.9:tokenScore(n,key);
    if (s>score) { score=s; best=it; }
  }
  if (!best) return null;

  const doi = best.DOI || null;
  const citations = (typeof best["is-referenced-by-count"] === "number") ? best["is-referenced-by-count"] : null;
  return { source:"crossref", matched:(Array.isArray(best.title)?best.title[0]:best.title)||"", score, citations, doi };
}

// ---- 무료 제공처 3: OpenCitations (DOI 필요) ----
async function lookupOpenCitationsByDOI(doi) {
  if (!doi) return null;
  const url = `https://opencitations.net/index/api/v1/citation-count/${encodeURIComponent(doi)}`;
  const data = await jget(url);
  const c = Array.isArray(data) && data[0] && typeof data[0].count === "number" ? data[0].count : null;
  return (typeof c === "number") ? { source:"opencitations", citations:c } : null;
}

async function resolveCitations(title) {
  // 1) OpenAlex
  try {
    const a = await lookupOpenAlex(title);
    if (a) {
      if (a.citations != null) return a;
      // OpenAlex가 DOI만 줬고 인용은 null이면 DOI로 OpenCitations 보완
      const oc = await lookupOpenCitationsByDOI(a.doi);
      if (oc) return { ...oc, matched:a.matched, score:a.score };
    }
  } catch (e) {
    if (String(e.message||e).startsWith("paid_or_blocked")) throw e; // 즉시 상위로
  }

  // 2) Crossref
  try {
    const c = await lookupCrossref(title);
    if (c) {
      if (c.citations != null) return c;
      const oc = await lookupOpenCitationsByDOI(c.doi);
      if (oc) return { ...oc, matched:c.matched, score:c.score };
    }
  } catch (e) {
    if (String(e.message||e).startsWith("paid_or_blocked")) throw e;
  }

  return null;
}

(async function main(){
  try {
    const prev = readPrevJSON();
    const prevMap = {};
    if (prev && Array.isArray(prev.items)) {
      for (const it of prev.items) {
        prevMap[norm(it.title)] = (typeof it.citations === "number" ? it.citations : null);
      }
    }

    const items = [];
    let total = 0;

    for (const t of TARGET_TITLES) {
      let info = null;
      try { info = await resolveCitations(t); }
      catch (e) {
        // 비용/키 요구 신호 감지 → 전체 중단 + 이전 데이터 보존
        if (String(e.message||e).startsWith("paid_or_blocked")) {
          console.error("Provider turned paid or blocked:", e.message);
          if (prev) {
            fs.writeFileSync(
              path.join("assets","citation.json"),
              JSON.stringify(prev, null, 2),
              "utf-8"
            );
            console.log("Kept previous JSON (no new calls).");
            process.exit(0);
          } else {
            console.log("No previous JSON; writing empty-safe structure.");
            fs.mkdirSync("assets", { recursive:true });
            fs.writeFileSync(path.join("assets","citation.json"),
              JSON.stringify({ updated_at:new Date().toISOString(), source:"free-only", total:0, items:[] }, null, 2)
            );
            process.exit(0);
          }
        }
      }

      let c = info && typeof info.citations === "number" ? info.citations : null;
      if (c == null && prevMap[norm(t)] != null) c = prevMap[norm(t)]; // 이전값 유지

      items.push({
        title: t,
        citations: c,
        _src: info ? info.source : (prevMap[norm(t)] != null ? "prev" : null),
        _matched: info ? (info.matched || null) : null,
        _score: info && info.score != null ? Number(info.score.toFixed(3)) : null
      });
      if (typeof c === "number") total += c;

      await sleep(250);
    }

    const out = {
      updated_at: new Date().toISOString(),
      source_chain: ["openalex","crossref","opencitations"],
      total,
      items
    };

    fs.mkdirSync("assets", { recursive:true });
    fs.writeFileSync(path.join("assets","citation.json"), JSON.stringify(out, null, 2), "utf-8");
    console.log("Wrote /assets/citation.json total:", total);
  } catch (e) {
    console.error(e.stack || e.message || String(e));
    process.exit(1);
  }
})();
