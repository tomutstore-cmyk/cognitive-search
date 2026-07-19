import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import SearchAperture from "@/components/search/SearchAperture";
import ResultCard from "@/components/search/ResultCard";
import { Fish, Globe, ArrowRight, ChevronDown } from "lucide-react";

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

  const runSearch = useCallback(async (q) => {
    const clean = q.trim();
    if (!clean) return;
    setLoading(true);
    setError("");
    setSubmittedQuery(clean);
    setResults([]);

    try {
      const res = await base44.functions.invoke("webSearch", { query: clean });
      const data = res.data || {};
      const list = Array.isArray(data?.results) ? data.results : [];
      setResults(
        list.map((r) => ({
          title: r.title,
          url: r.url,
          snippet: r.snippet,
          source: hostOf(r.url),
        }))
      );
    } catch (e) {
      setError("Pencarian gagal. Coba lagi sebentar lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onSearch = () => runSearch(query);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("aperture-input")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hasResults = !loading && results.length > 0;
  const noResults = !loading && !!submittedQuery && !error && results.length === 0;
  const isLanding = !submittedQuery && !loading && !hasResults;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Generative background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full aurora-anim"
          style={{ background: "radial-gradient(circle, rgba(255,122,41,0.09), transparent 65%)" }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[55vw] h-[55vw] rounded-full aurora-anim2"
          style={{ background: "radial-gradient(circle, rgba(74,93,90,0.12), transparent 65%)" }}
        />
      </div>

      <GhostNav query={submittedQuery} onHome={() => { setSubmittedQuery(""); setQuery(""); }} />

      <main className="relative">
        {isLanding && <Landing query={query} setQuery={setQuery} onSearch={onSearch} loading={loading} />}

        {!isLanding && (
          <div className="max-w-3xl mx-auto px-5 md:px-8 pb-32 pt-28 md:pt-32">
            {/* Compact search */}
            <div className="mb-8 md:mb-10">
              <SearchAperture query={query} setQuery={setQuery} onSearch={onSearch} loading={loading} compact />
            </div>

            {/* Result meta */}
            {!loading && !error && (
              <div className="flex items-center gap-2 px-1 mb-3 text-sm text-moss">
                <Globe className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>
                  {hasResults
                    ? `Sekitar ${results.length} hasil untuk `
                    : noResults
                    ? "Tidak ada hasil untuk "
                    : ""}
                  <span className="font-medium text-foreground">"{submittedQuery}"</span>
                </span>
              </div>
            )}

            {error ? (
              <div className="glass rounded-2xl p-8 text-center fade-rise">
                <p className="text-foreground/70">{error}</p>
              </div>
            ) : loading ? (
              <ResultsSkeleton />
            ) : noResults ? (
              <div className="glass rounded-2xl p-10 text-center fade-rise">
                <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-5 h-5 text-moss/60" strokeWidth={1.5} />
                </div>
                <p className="text-foreground/80 font-medium">Tidak ada hasil ditemukan</p>
                <p className="text-sm text-moss mt-1.5">Coba kata kunci lain atau periksa ejaannya.</p>
              </div>
            ) : (
              <div aria-live="polite" className="space-y-1">
                {results.map((r, i) => (
                  <ResultCard key={i} result={r} index={i} />
                ))}
              </div>
            )}

            {hasResults && <DeepSearchFooter onPick={(q) => { setQuery(q); runSearch(q); }} />}
          </div>
        )}
      </main>
    </div>
  );
}

function GhostNav({ query, onHome }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!query) return null;
  return (
    <header
      className={`fixed top-0 inset-x-0 z-30 transition-all duration-500 ${
        show ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="glass border-b border-foreground/8">
        <div className="max-w-3xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-4">
          <button onClick={onHome} className="flex items-center gap-2 focus-ring rounded">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-[#e85a1f] flex items-center justify-center shadow-sm">
              <Fish className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="font-semibold tracking-tight text-foreground">Cariikan.com</span>
          </button>
          <nav className="hidden md:flex items-center gap-1.5 text-xs text-moss">
            <span className="px-2 py-1 rounded-full bg-foreground/4">Pencarian</span>
            <ChevronDown className="w-3 h-3 -rotate-90" strokeWidth={1.75} />
            <span className="px-2 py-1 rounded-full bg-accent/10 text-accent font-medium max-w-xs truncate">
              {query}
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
}

function Landing({ query, setQuery, onSearch, loading }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 md:px-8">
      <div className="w-full max-w-4xl mx-auto text-center fade-rise">
        {/* Mark */}
        <div className="flex items-center justify-center gap-3 mb-12 md:mb-16">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-[#e85a1f] flex items-center justify-center shadow-[0_8px_28px_-8px_rgba(204,51,0,0.45)]">
            <Fish className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <span className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            Cari<span className="text-accent">ikan</span>.com
          </span>
        </div>

        <div className="mt-14 md:mt-20">
          <SearchAperture query={query} setQuery={setQuery} onSearch={onSearch} loading={loading} />
        </div>
      </div>
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-2" aria-live="polite">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-xl p-5">
          <div className="h-3 w-32 rounded shimmer mb-3" />
          <div className="h-5 w-3/4 rounded shimmer mb-3" />
          <div className="h-3.5 rounded shimmer mb-2" />
          <div className="h-3.5 rounded shimmer w-5/6" />
        </div>
      ))}
    </div>
  );
}

function DeepSearchFooter({ onPick }) {
  const prompts = [
    "resep sederhana",
    "sejarah singkat",
    "tips pemula",
    "dimana beli",
  ];
  return (
    <footer id="deep-search" className="mt-16 pt-10 border-t border-foreground/10">
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-widest text-moss">Cari lebih dalam</p>
        <p className="text-foreground/60 mt-1.5 text-sm">Pencarian lanjutan dengan satu ketukan.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full glass border border-foreground/8 hover:border-accent/40 text-sm text-foreground/75 hover:text-foreground transition-all focus-ring"
          >
            {p}
            <ArrowRight className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
          </button>
        ))}
      </div>
      <div className="mt-12 text-center text-xs text-moss/60">
        Cariikan.com · Pencarian Web · Hasil nyata dari web
      </div>
    </footer>
  );
}