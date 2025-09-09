import json, re, unicodedata, datetime, pathlib, requests
from bs4 import BeautifulSoup

SCHOLAR_ID = "5B2BRooAAAAJ"
URL = f"https://scholar.google.com/citations?hl=en&user={SCHOLAR_ID}&view_op=list_works&pagesize=200"

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

def norm(s: str) -> str:
    s = unicodedata.normalize("NFKC", s).lower()
    s = s.replace("–","-").replace("—","-")
    s = re.sub(r"&", " and ", s)
    s = re.sub(r"[^a-z0-9]+", "", s)
    return s

def fetch_entries():
    html = requests.get(URL, timeout=30, headers={"User-Agent":"Mozilla/5.0"}).text
    soup = BeautifulSoup(html, "lxml")
    rows = soup.select("tr.gsc_a_tr")
    out = []
    for r in rows:
        a = r.select_one("a.gsc_a_at")
        if not a: 
            continue
        title = a.get_text(strip=True)
        c = 0
        c_a = r.select_one("td.gsc_a_c a")
        if c_a:
            txt = c_a.get_text(strip=True).replace(",", "")
            c = int(txt) if txt.isdigit() else 0
        out.append((title, c))
    return out

def main():
    entries = fetch_entries()
    by_norm = {norm(t): c for (t, c) in entries}

    items = []
    for t in TARGET_TITLES:
        key = norm(t)
        val = by_norm.get(key)
        if val is None:
            for et, ec in entries:
                nt = norm(et)
                if key in nt or nt in key:
                    val = ec
                    break
        items.append({"title": t, "citations": (None if val is None else int(val))})

    total = sum(it["citations"] or 0 for it in items)
    data = {
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "scholar_user": SCHOLAR_ID,
        "total": total,
        "items": items,
    }

    out_path = pathlib.Path("assets") / "citation.json"  # ← 네가 쓰는 파일명/경로
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote", out_path, "total =", total)

if __name__ == "__main__":
    main()
