# scripts/update_scholar.py
import json, re, unicodedata, datetime, pathlib, requests
from bs4 import BeautifulSoup

SCHOLAR_ID = "5B2BRooAAAAJ"
URLS = [
    f"https://scholar.google.com/citations?hl=en&user={SCHOLAR_ID}&view_op=list_works&pagesize=200",
    f"https://scholar.google.co.kr/citations?hl=en&user={SCHOLAR_ID}&view_op=list_works&pagesize=200",
    f"https://scholar.google.com/citations?hl=ko&user={SCHOLAR_ID}&view_op=list_works&pagesize=200",
]

TARGET_TITLES = [
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
]

UA_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/121.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
    "Referer": "https://scholar.google.com/",
    "Cache-Control": "no-cache",
}

def norm(s: str) -> str:
    s = unicodedata.normalize("NFKC", s or "").lower()
    s = s.replace("–","-").replace("—","-").replace("&"," and ")
    s = re.sub(r"[^a-z0-9]+", "", s)
    return s

def parse_entries(html: str):
    soup = BeautifulSoup(html, "lxml")
    rows = soup.select("tr.gsc_a_tr")
    entries = []
    for r in rows:
        a = r.select_one("a.gsc_a_at")
        if not a:
            continue
        title = a.get_text(" ", strip=True)

        # 인용수: <td class="gsc_a_c"><a>194</a></td> 또는 대시(—)일 수 있음
        cites = 0
        ccell = r.select_one("td.gsc_a_c")
        if ccell:
            alink = ccell.select_one("a")
            if alink:
                txt = alink.get_text(strip=True).replace(",", "")
                if txt.isdigit():
                    cites = int(txt)
        entries.append((title, cites))
    return entries

def fetch_first_working():
    last_html = None
    for url in URLS:
        resp = requests.get(url, timeout=30, headers=UA_HEADERS)
        html = resp.text
        last_html = html
        lower = html.lower()
        # 봇 차단 감지
        if ("unusual traffic" in lower) or ("captcha" in lower) or ("gs_captcha" in lower):
            continue
        entries = parse_entries(html)
        if entries:
            return url, entries
    return None, last_html  # 실패 시 마지막 HTML 반환

def main():
    used, data_or_html = fetch_first_working()
    if used is None:
        # 파싱 실패: 디버그 HTML을 커밋해 확인 가능하게 남김
        debug_path = pathlib.Path("assets") / "_last_scholar_fetch.html"
        debug_path.parent.mkdir(parents=True, exist_ok=True)
        debug_path.write_text(data_or_html or "", encoding="utf-8")
        raise SystemExit("Failed to parse Scholar (wrote assets/_last_scholar_fetch.html)")

    entries = data_or_html
    by_norm = {norm(t): c for (t, c) in entries}

    items = []
    for t in TARGET_TITLES:
        key = norm(t)
        val = by_norm.get(key)
        if val is None:
            # 느슨한 포함 매칭
            for et, ec in entries:
                nt = norm(et)
                if key in nt or nt in key:
                    val = ec
                    break
        items.append({"title": t, "citations": (None if val is None else int(val))})

    total = sum(it["citations"] or 0 for it in items)
    out = {
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "scholar_user": SCHOLAR_ID,
        "source_url_used": used,
        "total": total,
        "items": items,
    }

    out_path = pathlib.Path("assets") / "citation.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Parsed", len(entries), "rows from:", used)
    print("Total citations (11):", total)

if __name__ == "__main__":
    main()
