(async function () {
  try {
    const res = await fetch("/assets/citation.json?ts=" + Date.now(), { cache: "no-store" });
    const data = await res.json();

    let total = 0;
    if (typeof data === "number") total = data;
    else if (data && typeof data.total === "number") total = data.total;
    else if (data && Array.isArray(data.items))
      total = data.items.reduce((s, it) => s + (typeof it.citations === "number" ? it.citations : 0), 0);

    const iso = (data && data.updated_at) ? data.updated_at : new Date().toISOString();
    const when = new Date(iso).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "Asia/Seoul" });

    document.getElementById("citations-all-line").textContent =
      `${(total || 0).toLocaleString()} citations in total (${when}).`;
  } catch (e) {
    console.error(e);
    document.getElementById("citations-all-line").textContent = "Citations unavailable";
  }
})();
