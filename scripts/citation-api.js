// scripts/citation-api.js
// Free-only, citation aggregator by DOI/ID:
// OpenAlex(ID) + Crossref(doi) + OpenCitations(doi) → pick MAX
// Cache OpenAlex ID/DOI to avoid title mismatches.
// Output: assets/citation.json   Cache: assets/citation_cache.json

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

// 예의상 메일(선택). 비워도 OK.
const MAILTO = process.env.MAILTO || "";

// 비용/보안: 허용 도메인만 호출
const ALLOWLIST = [
  "https://api.openalex.org/",
  "https://api.crossref.org/",
  "https://opencitations.net/",
];

// 파일 경로
const OUT_JSON   = path.join("assets", "citation.json");
const CACHE_JSON = path.join("assets", "citation_cache.json");

// ---- 유틸 ----
function norm(s){
  return (s||"").normalize("NFKC").toLowerCase()
    .replace(/[–—]/g,"-").replace(/&/g," and ").replace(/[^a-z0-9]+/g,"");
}
function tokenScore(a,b){
  const A=new Set(a.match(/[a-z0-9]+/g)||[]);
  const B=new Set(b.match(/[a-z0-9]+/g)||[]);
  const inter=[...A].filter(t=>B.has(t)).length;
  const uni=new Set([...A,...B]).size||1;
  return inter/uni;
}
function inAllowlist(url){ return ALLOWLIST.some(p=>url.startsWith(p)); }
async function jget(url){
  if(!inAllowlist(url)) throw new Error(`blocked_url: ${url}`);
  const r = await fetch(url, { headers:{ "User-Agent":"Mozilla/5.0" }});
  if([401,402,403].includes(r.status)) throw new Error(`paid_or_blocked: ${r.status} ${url}`);
  if(!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.json();
}
const sleep = ms => new Promise(r=>setTimeout(r,ms));

// ---- 캐시 ----
function loadCache(){
  if(fs.existsSync(CACHE_JSON)){
    try { return JSON.parse(fs.readFileSync(CACHE_JSON,"utf-8")); } catch {}
  }
  return { updated_at:null, map:{} }; // map[norm(title)] = { openalex_id, doi, matched, score }
}
function saveCache(cache){
  fs.mkdirSync(path.dirname(CACHE_JSON), { recursive:true });
  fs.writeFileSync(CACHE_JSON, JSON.stringify({ ...cache, updated_at:new Date().toISOString() }, null, 2), "utf-8");
}
function loadPrevOut(){
  if(fs.existsSync(OUT_JSON)){
    try { return JSON.parse(fs.readFileSync(OUT_JSON,"utf-8")); } catch {}
  }
  return null;
}

// ---- OpenAlex ----
async function oaSearchByTitle(title){
  const q = encodeURIComponent(title);
  const m = MAILTO ? `&mailto=${encodeURIComponent(MAILTO)}` : "";
  const url = `https://api.openalex.org/works?search=${q}&per_page=10${m}`;
  const data = await jget(url);
  const results = data.results || [];
  const key = norm(title);
  let best=null, score=-1;
  for(const r of results){
    const name = r.display_name || r.title || "";
    const n = norm(name);
    const s = (n===key)?1 : (n.includes(key)||key.includes(n))?0.95 : tokenScore(n,key);
    if(s>score){ score=s; best=r; }
  }
  if(!best) return null;
  const oaid = best.id || best.openalex || best.ids?.openalex || null; // e.g. https://openalex.org/Wxxxx
  const id   = oaid ? oaid.split("/").pop() : null;
  const doi  = best.doi ? best.doi.replace(/^https?:\/\/doi.org\//,'')
              : (best.ids && best.ids.doi ? best.ids.doi.replace(/^https?:\/\/doi.org\//,'') : null);
  return { id, doi, matched: best.display_name || "", score: Number(score.toFixed(3)) };
}
async function oaGetById(id){
  const m = MAILTO ? `&mailto=${encodeURIComponent(MAILTO)}` : "";
  const url = `https://api.openalex.org/works/${encodeURIComponent(id)}?select=display_name,ids,cited_by_count${m}`;
  return jget(url);
}

// ---- Crossref (by DOI) ----
async function crCountByDOI(doi){
  if(!doi) return null;
  const m = MAILTO ? `?mailto=${encodeURIComponent(MAILTO)}` : "";
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}${m}`;
  const data = await jget(url);
  const msg = data.message || {};
  return (typeof msg["is-referenced-by-count"]==="number") ? msg["is-referenced-by-count"] : null;
}

// ---- OpenCitations (by DOI) ----
async function ocCountByDOI(doi){
  if(!doi) return null;
  const url = `https://opencitations.net/index/api/v1/citation-count/${encodeURIComponent(doi)}`;
  const data = await jget(url);
  const c = Array.isArray(data) && data[0] && typeof data[0].count==="number" ? data[0].count : null;
  return c;
}

(async function main(){
  try{
    const cache = loadCache();
    const prev  = loadPrevOut();
    const prevMap = {};
    if(prev && Array.isArray(prev.items)){
      for(const it of prev.items) prevMap[norm(it.title)] = (typeof it.citations==="number" ? it.citations : null);
    }

    const items = [];
    let total = 0;
    let cacheTouched = false;

    for(const t of TARGET_TITLES){
      const key = norm(t);

      // 1) 캐시된 OpenAlex ID/DOI
      let entry = cache.map[key] || null;

      // 2) 없으면 검색해서 캐시
      if(!entry || !entry.openalex_id){
        const found = await oaSearchByTitle(t);
        if(found && found.id){
          entry = { openalex_id: found.id, doi: found.doi || null, matched: found.matched || "", score: found.score || null };
          cache.map[key] = entry;
          cacheTouched = true;
          await sleep(150);
        }
      }

      // 3) 각 소스에서 카운트 수집
      const counts = {};
      try{
        if(entry && entry.openalex_id){
          const w = await oaGetById(entry.openalex_id);
          if(typeof w.cited_by_count === "number") counts.openalex = w.cited_by_count;
          if(!entry.doi){
            const doi = w.ids && w.ids.doi ? String(w.ids.doi).replace(/^https?:\/\/doi.org\//,'') : null;
            if(doi){ entry.doi = doi; cacheTouched = true; }
          }
        }
      }catch{}
      try{
        if(entry && entry.doi != null){
          const c = await crCountByDOI(entry.doi);
          if(typeof c === "number") counts.crossref = c;
        }
      }catch{}
      try{
        if(entry && entry.doi != null){
          const c = await ocCountByDOI(entry.doi);
          if(typeof c === "number") counts.opencitations = c;
        }
      }catch{}

      // 4) 최종값: 세 소스 중 최대값(under-count 방지)
      const nums = Object.values(counts).filter(v => typeof v === "number");
      let finalC = nums.length ? Math.max(...nums) : null;

      // 5) 이전 값보다 내려가면 이전 값 유지
      const prevC = prevMap[key];
      if(typeof prevC === "number" && (finalC == null || finalC < prevC)){
        finalC = prevC;
      }

      items.push({
        title: t,
        citations: finalC,
        _id: entry ? entry.openalex_id : null,
        _doi: entry ? entry.doi : null,
        _matched: entry ? entry.matched : null,
        _debug_counts: counts  // { openalex: n, crossref: n, opencitations: n }
      });
      if(typeof finalC === "number") total += finalC;

      await sleep(150);
    }

    if(cacheTouched) saveCache(cache);

    const out = {
      updated_at: new Date().toISOString(),
      source_chain: ["openalex(id)","crossref(doi)","opencitations(doi)","policy=max;floor=prev"],
      total,
      items
    };

    fs.mkdirSync(path.dirname(OUT_JSON), { recursive:true });
    fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2), "utf-8");
    console.log("Wrote", OUT_JSON, "total:", total);
  }catch(e){
    console.error(e.stack || e.message || String(e));
    process.exit(1);
  }
})();
