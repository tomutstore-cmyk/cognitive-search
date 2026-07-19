// Cariikan.com — static client-side search via DuckDuckGo (HTML) through public CORS proxies.

const PROMOTED_RESULT = {
  title: "Currican — Extreme Sport Pesca",
  url: "https://currican.extremesportpesca.com/",
  snippet:
    "Currican — Extreme Sport Pesca: informasi dan layanan seputar olahraga memancing currican / kite fishing.",
  source: "currican.extremesportpesca.com",
  promoted: true,
};

const PROMPTS = ["resep sederhana", "sejarah singkat", "tips pemula", "dimana beli"];

// Try several public proxies in order; first that returns parseable results wins.
const PROXIES = [
  (u) => "https://api.allorigins.win/raw?url=" + encodeURIComponent(u),
  (u) => "https://corsproxy.io/?url=" + encodeURIComponent(u),
  (u) => "https://thingproxy.freeboard.io/fetch/" + u,
];

const $ = (s) => document.querySelector(s);
const landing = $("#landing");
const resultsView = $("#results-view");
const formLanding = $("#search-form");
const inputLanding = $("#search-input");
const formCompact = $("#search-form-2");
const inputCompact = $("#search-input-2");
const clearBtn = $("#clear-btn");
const meta = $("#meta");
const metaText = $("#meta-text");
const status = $("#status");
const results = $("#results");
const promptsBox = $("#prompts");

let loading = false;

// Render the quick-prompt chips
PROMPTS.forEach((p) => {
  const b = document.createElement("button");
  b.className = "chip";
  b.innerHTML = p + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  b.addEventListener("click", () => runSearch(p));
  promptsBox.appendChild(b);
});

// Wire forms
formLanding.addEventListener("submit", (e) => { e.preventDefault(); submit(inputLanding.value); });
formCompact.addEventListener("submit", (e) => { e.preventDefault(); submit(inputCompact.value); });
inputLanding.addEventListener("input", () => { clearBtn.hidden = !inputLanding.value; });
clearBtn.addEventListener("click", () => { inputLanding.value = ""; clearBtn.hidden = true; inputLanding.focus(); });
$("#home-btn").addEventListener("click", goHome);

function submit(q) {
  const clean = (q || "").trim();
  if (!clean) return;
  inputLanding.value = clean;
  inputCompact.value = clean;
  runSearch(clean);
}

function goHome() {
  landing.hidden = false;
  resultsView.hidden = true;
  inputLanding.value = "";
  clearBtn.hidden = true;
  window.scrollTo(0, 0);
  inputLanding.focus();
}

function showResultsView(q) {
  landing.hidden = true;
  resultsView.hidden = false;
  window.scrollTo(0, 0);
}

function setMeta(q, n) {
  meta.hidden = false;
  metaText.innerHTML = `Sekitar ${n} hasil untuk <b>"${escapeHtml(q)}"</b>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}
function pathOf(url) {
  try { const u = new URL(url); return u.pathname.replace(/\/+$/, "") || "/"; } catch { return ""; }
}

// DuckDuckGo redirect links look like //duckduckgo.com/l/?uddg=<encoded real url>
function decodeDdgHref(href) {
  try {
    let h = href.trim();
    if (h.startsWith("//")) h = "https:" + h;
    const u = new URL(h);
    const uddg = u.searchParams.get("uddg");
    return uddg ? decodeURIComponent(uddg) : h;
  } catch { return href; }
}

async function fetchSearchHtml(query) {
  const target = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
  for (const make of PROXIES) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(make(target), {
        headers: { "Accept": "text/html" },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const html = await res.text();
      if (html && html.indexOf("result__a") !== -1) return html;
    } catch { clearTimeout(timer); /* try next proxy */ }
  }
  throw new Error("all proxies failed");
}

function parseDdg(html, query) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const items = [];
  const seen = new Set();
  doc.querySelectorAll(".result, .web-result").forEach((el) => {
    const a = el.querySelector("a.result__a");
    if (!a) return;
    const url = decodeDdgHref(a.getAttribute("href") || a.href || "");
    if (!url || seen.has(url)) return;
    seen.add(url);
    const title = (a.textContent || "").trim();
    const snipEl = el.querySelector(".result__snippet");
    const snippet = snipEl ? (snipEl.textContent || "").trim() : "";
    if (!title) return;
    items.push({ title, url, snippet, source: hostOf(url) });
    if (items.length >= 10) return;
  });
  return items;
}

function renderSkeletons() {
  status.hidden = true;
  meta.hidden = true;
  let h = "";
  for (let i = 0; i < 6; i++) {
    h += `<div class="skel"><div class="ln l1 shimmer"></div><div class="ln l2 shimmer"></div><div class="ln l3 shimmer"></div><div class="ln l4 shimmer"></div><div class="div"></div></div>`;
  }
  results.innerHTML = h;
}

function renderError(msg) {
  results.innerHTML = `<div class="err"><p>${escapeHtml(msg)}</p></div>`;
}

function renderEmpty(q) {
  results.innerHTML = `<div class="empty"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg></div><p>Tidak ada hasil ditemukan</p><span>Coba kata kunci lain atau periksa ejaannya.</span></div>`;
  meta.hidden = true;
}

function renderResults(list, q) {
  const all = [PROMOTED_RESULT, ...list];
  setMeta(q, all.length);
  results.innerHTML = all.map((r, i) => cardHtml(r, i)).join("");
}

function cardHtml(r, i) {
  const host = hostOf(r.url);
  const path = pathOf(r.url);
  const badge = r.promoted ? `<span class="badge">Iklan</span>` : "";
  const snippet = r.snippet ? `<p class="snippet">${escapeHtml(r.snippet)}</p>` : "";
  return `
    <article class="card" style="animation-delay:${Math.min(i * 60, 420)}ms">
      <div class="card-inner">
        <div class="src">
          <span class="fav">${(host[0] || "•").toUpperCase()}</span>
          <span class="host">${escapeHtml(host)}</span>
          <span class="sep">›</span>
          <span class="path">${escapeHtml(path)}</span>
          ${badge}
        </div>
        <a class="title" href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.title)}</a>
        ${snippet}
        <div class="actions">
          <a class="visit" href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            Kunjungi sumber
          </a>
        </div>
      </div>
      <div class="divider"></div>
    </article>`;
}

async function runSearch(q) {
  const clean = q.trim();
  if (!clean || loading) return;
  loading = true;
  inputLanding.value = clean;
  inputCompact.value = clean;
  showResultsView(clean);
  renderSkeletons();
  setSubmitting(true);
  try {
    const html = await fetchSearchHtml(clean);
    const list = parseDdg(html, clean);
    if (list.length === 0) renderEmpty(clean);
    else renderResults(list, clean);
  } catch (e) {
    meta.hidden = true;
    renderError("Pencarian gagal. Coba lagi sebentar lagi.");
  } finally {
    loading = false;
    setSubmitting(false);
  }
}

function setSubmitting(on) {
  [formLanding.querySelector(".submit"), formCompact.querySelector(".submit")].forEach((b) => {
    b.disabled = on;
    b.innerHTML = on
      ? '<div class="spinner"></div>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  });
}

// Keyboard: focus search with "/"
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
    e.preventDefault();
    (landing.hidden ? inputCompact : inputLanding).focus();
  }
});