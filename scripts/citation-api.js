// scripts/citation-api.js
// Free-only (OpenAlex/Crossref/OpenCitations), DOI 기반 집계
// - 각 논문: 여러 DOI 허용 → DOI마다 (OpenAlex, Crossref, OpenCitations) 값 중 MAX 선택
// - 논문 최종값: DOI별 선택값을 합산 (Scholar 버전 묶음에 근접)
// - 이전 값보다 내려가면 이전값 유지
// 출력: assets/citation.json

const fs = require("fs");
const path = require("path");

// ===== 여기에 논문과 DOI를 넣음 (네가 준 순서대로 매핑) =====
const TARGET_ITEMS = [
  { title: "Effect of Curvature of the Electrodes on the Electrochemical Behavior of Li-Ion Batteries", dois: ["10.1149/1945-7111/adfd1a"] },
  { title: "Accelerating Simulations of Li-ion Battery Thermal Runaway Using Modified Patankar–Runge–Kutta Approach", dois: ["10.1016/j.applthermaleng.2024.123518"] },
  { title: "A robust numerical treatment of solid-phase diffusion in pseudo two-dimensional lithium-ion battery models", dois: ["10.1016/j.jpowsour.2022.232413"] },
  { title: "A Comprehensive Numerical and Experimental Study for the Passive Thermal Management in Battery Modules and Packs", dois: ["10.1149/1945-7111/ac9ee4"] },
  { title: "Modeling cell venting and gas-phase reactions in 18650 lithium ion batteries during thermal runaway", dois: ["10.1016/j.jpowsour.2021.229496"] },
  { title: "Transport Processes in a Li-ion Cell during an Internal Short-Circuit", dois: ["10.1149/1945-7111/ab995d"] },
  { title: "Modeling Extreme Deformations in Lithium-ion Batteries", dois: ["10.1016/j.etran.2020.100065"] },
  { title: "Two-dimensional modeling for physical processes in direct flame fuel cells", dois: ["10.1016/j.ijhydene.2018.12.169"] },
  { title: "A multipoint voltage-monitoring method for fuel cell inconsistency analysis", dois: ["10.1016/j.enconman.2018.09.077"] },
  { title: "Modeling liquid water re-distribution in bi-porous layer flow-fields of proton exchange membrane fuel cells", dois: ["10.1016/j.jpowsour.2018.08.018"] },
  { title: "Modeling two-phase flow in three-dimensional complex flow-fields of proton exchange membrane fuel cells", dois: ["10.1016/j.jpowsour.2017.09.003"] },
];

// 예의상 메일(선택)
const MAILTO = process.env.MAILTO || "";

// 비용/보안: 허용 도메인만 호출
const ALLOWLIST = [
  "https://api.openalex.org/",
  "https://api.crossref.org/",
  "https://opencitations.net/",
];

const OUT_JSON = path.join("assets", "citation.json");

// ---- 유틸 ----
function norm(s){ return (s||"").normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g,""); }
function inAllowlist(url){ return ALLOWLIST.some(p => url.startsWith(p)); }
function cleanDOI(s){
  const x = String(s||"").trim();
  return x
    .replace(/^https?:\/\/doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .trim();
}
async function jget(url){
  if(!inAllowlist(url)) throw new Error(`blocked_url: ${url}`);
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if([401,402,403].includes(r.status)) throw new Error(`paid_or_blocked: ${r.status} ${url}`);
  if(!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.json();
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

function loadPrev(){
  if (fs.existsSync(OUT_JSON)) {
    try { return JSON.parse(fs.readFileSync(OUT_JSON, "utf-8")); } catch {}
  }
  return null;
}

// ---- OpenAlex / Crossref / OpenCitations (모두 DOI 기반) ----
async function oaByDOI(doi){
  const base = `https://api.openalex.org/works/${encodeURIComponent("doi:"+doi)}?select=display_name,ids,cited_by_count`;
  const url = MAILTO ? `${base}&mailto=${encodeURIComponent(MAILTO)}` : base;
  const data = await jget(url);
  return (typeof data.cited_by_count === "number") ? data.cited_by_count : null;
}
async function crByDOI(doi){
  const base = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  const url = MAILTO ? `${base}?mailto=${encodeURIComponent(MAILTO)}` : base;
  const data = await jget(url);
  const msg = data.message || {};
  return (typeof msg["is-referenced-by-count"] === "number") ? msg["is-referenced-by-count"] : null;
}
async function ocByDOI(doi){
  const url = `https://opencitations.net/index/api/v1/citation-count/${encodeURIComponent(doi)}`;
  const data = await jget(url);
  const c = Array.isArray(data) && data[0] && typeof data[0].count === "number" ? data[0].count : null;
  return c;
}

(async function main(){
  try {
    const prev = loadPrev();
    const prevMap = {};
    if (prev && Array.isArray(prev.items)) {
      for (const it of prev.items) prevMap[norm(it.title)] = (typeof it.citations==="number" ? it.citations : null);
    }

    const items = [];
    let grand = 0;

    for (const item of TARGET_ITEMS) {
      const key = norm(item.title);
      const countsByDOI = {};   // 디버깅용
      let itemSum = 0;

      for (const doiRaw of item.dois) {
        const doi = cleanDOI(doiRaw);
        if (!doi) continue;

        const triple = {};
        try { triple.openalex = await oaByDOI(doi); } catch {}
        await sleep(120);
        try { triple.crossref = await crByDOI(doi); } catch {}
        await sleep(120);
        try { triple.opencitations = await ocByDOI(doi); } catch {}

        countsByDOI[doi] = triple;

        // DOI 하나에 대해 셋 중 최대값 선택(과소계수 방지)
        const nums = Object.values(triple).filter(v => typeof v === "number");
        const one = nums.length ? Math.max(...nums) : 0;
        itemSum += one;
        await sleep(120);
      }

      // 이전 값보다 내려가면 이전 값 유지
      const prevC = prevMap[key];
      let finalC = itemSum;
      if (typeof prevC === "number" && finalC < prevC) finalC = prevC;

      items.push({
        title: item.title,
        citations: finalC,
        _dois: item.dois,
        _debug_counts: countsByDOI
      });

      grand += (typeof finalC === "number" ? finalC : 0);
    }

    const out = {
      updated_at: new Date().toISOString(),
      source_chain: ["openalex(doi)","crossref(doi)","opencitations(doi)","policy=perDOI:max, perItem:sum, floor=prev"],
      total: grand,
      items
    };

    fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
    fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2), "utf-8");
    console.log("Wrote", OUT_JSON, "total:", grand);
  } catch (e) {
    console.error(e.stack || e.message || String(e));
    process.exit(1);
  }
})();
