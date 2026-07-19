import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import SearchAperture from "@/components/search/SearchAperture";
import AISummary from "@/components/search/AISummary";
import ResultCard from "@/components/search/ResultCard";
import KnowledgeNode from "@/components/search/KnowledgeNode";
import RecentSearches from "@/components/search/RecentSearches";
import ResearchBucket from "@/components/search/ResearchBucket";
import { Bookmark, ArrowRight, Layers, Globe, Brain, ChevronDown } from "lucide-react";

const SUGGESTIONS = [
  "the future of neural architectures",
  "how glass refracts light",
  "compare GPT and Claude reasoning",
  "origins of minimalist design",
];

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem("monolith_history") || "[]");
  } catch {
    return [];
  }
}
function saveHistory(items) {
  localStorage.setItem("monolith_history", JSON.stringify(items.slice(0, 20)));
}
function loadBucket() {
  try {
    return JSON.parse(localStorage.getItem("monolith_bucket") || "[]");
  } catch {
    return [];
  }
}
function saveBucket(items) {
  localStorage.setItem("monolith_bucket", JSON.stringify(items.slice(0, 50)));
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [results, setResults] = useState([]);
  const [knowledge, setKnowledge] = useState(null);
  const [citations, setCitations] = useState([]);

  const [history, setHistory] = useState(loadHistory);
  const [bucket, setBucket] = useState(loadBucket);
  const [bladeOpen, setBladeOpen] = useState(false);
  const [bucketOpen, setBucketOpen] = useState(false);

  const addToBucket = useCallback((result) => {
    setBucket((prev) => {
      if (prev.some((r) => r.url === result.url)) return prev;
      const next = [{ ...result, id: crypto.randomUUID() }, ...prev];
      saveBucket(next);
      return next;
    });
  }, []);

  const runSearch = useCallback(async (q) => {
    const clean = q.trim();
    if (!clean) return;
    setLoading(true);
    setError("");
    setSubmittedQuery(clean);
    setSummary("");
    setResults([]);
    setKnowledge(null);
    setCitations([]);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform a comprehensive web search for the query: "${clean}". 

Return:
1. "summary": a synthesized 2-4 sentence answer distilling the most important knowledge about the query, written neutrally and helpfully.
2. "results": an array of 6-8 of the most relevant real web pages. Each must include a real, reachable "url", a concise "title", a "snippet" (2-3 sentences capturing the page's value), and a "source" (the site/brand name).
3. "knowledge": an entity card object with "entity" (canonical name), "description" (1-2 sentences), "facts" (array of 4-5 distinct, interesting factual bullets), and "url" (a canonical reference link like Wikipedia if applicable, else the best source).

Only include real, verifiable URLs that exist on the web. Do not fabricate links.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  url: { type: "string" },
                  snippet: { type: "string" },
                  source: { type: "string" },
                },
              },
            },
            knowledge: {
              type: "object",
              properties: {
                entity: { type: "string" },
                description: { type: "string" },
                facts: { type: "array", items: { type: "string" } },
                url: { type: "string" },
              },
            },
          },
        },
      });

      setSummary(res.summary || "");
      setResults(Array.isArray(res.results) ? res.results : []);
      setKnowledge(res.knowledge || null);
      setCitations(Array.isArray(res.results) ? res.results.slice(0, 6) : []);

      setHistory((prev) => {
        const next = [{ id: crypto.randomUUID(), query: clean, at: Date.now() }, ...prev.filter((h) => h.query !== clean)];
        saveHistory(next);
        return next;
      });
    } catch (e) {
      setError("Synthesis failed. Please rephrase or try again.");
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

  const hasResults = !loading && (summary || results.length > 0 || knowledge);
  const isLanding = !submittedQuery && !loading && !hasResults;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Generative background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full aurora-anim"
          style={{ background: "radial-gradient(circle, rgba(204,51,0,0.10), transparent 65%)" }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[55vw] h-[55vw] rounded-full aurora-anim2"
          style={{ background: "radial-gradient(circle, rgba(74,93,90,0.12), transparent 65%)" }}
        />
      </div>

      <RecentSearches
        items={history}
        open={bladeOpen}
        setOpen={setBladeOpen}
        onPick={(q) => {
          setQuery(q);
          runSearch(q);
        }}
        onClear={() => { setHistory([]); saveHistory([]); }}
        onRemove={(id) => {
          const next = history.filter((h) => h.id !== id);
          setHistory(next);
          saveHistory(next);
        }}
      />

      <div className={`transition-all duration-500 ${bladeOpen ? "md:ml-64" : ""}`}>
        {/* Ghost navigation */}
        <GhostNav query={submittedQuery} onHome={() => { setSubmittedQuery(""); setQuery(""); }} />

        <main className="relative">
          {isLanding && <Landing query={query} setQuery={setQuery} onSearch={onSearch} loading={loading} />}

          {!isLanding && (
            <div className="max-w-6xl mx-auto px-5 md:px-8 pb-32 pt-28 md:pt-32">
              {/* Compact search */}
              <div id="aperture-input-wrap" className="mb-8 md:mb-10">
                <SearchAperture query={query} setQuery={setQuery} onSearch={onSearch} loading={loading} compact />
              </div>

              {error ? (
                <div className="glass rounded-2xl p-8 text-center fade-rise">
                  <p className="text-foreground/70">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr_0.8fr] gap-6 lg:gap-8"
                     aria-live="polite">
                  <div className="space-y-6 lg:order-1">
                    <AISummary summary={summary} citations={citations} loading={loading} />
                  </div>
                  <div className="lg:order-2 space-y-2">
                    <div className="flex items-center gap-2 px-1 mb-2">
                      <Globe className="w-3.5 h-3.5 text-moss" strokeWidth={1.75} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-moss">
                        Web Stream
                      </span>
                      {!loading && results.length > 0 && (
                        <span className="text-xs text-moss/60">· {results.length} sources</span>
                      )}
                    </div>
                    {loading ? (
                      <ResultsSkeleton />
                    ) : (
                      results.map((r, i) => (
                        <div key={i} className="relative group/card">
                          <ResultCard result={r} index={i} />
                          <button
                            onClick={() => addToBucket(r)}
                            aria-label="Save to research bucket"
                            className="absolute top-4 right-2 opacity-0 group-hover/card:opacity-100 p-2 rounded-full glass hover:border-accent/40 border border-transparent transition-all focus-ring"
                          >
                            <Bookmark className="w-3.5 h-3.5 text-moss hover:text-accent" strokeWidth={1.75} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="lg:order-3">
                    <div className="lg:sticky lg:top-28 space-y-6">
                      <KnowledgeNode knowledge={knowledge} loading={loading} />
                    </div>
                  </div>
                </div>
              )}

              {hasResults && <DeepSearchFooter onPick={(q) => { setQuery(q); runSearch(q); }} />}
            </div>
          )}
        </main>
      </div>

      <ResearchBucket
        items={bucket}
        open={bucketOpen}
        setOpen={setBucketOpen}
        onRemove={(id) => {
          const next = bucket.filter((b) => b.id !== id);
          setBucket(next);
          saveBucket(next);
        }}
        onClear={() => { setBucket([]); saveBucket([]); }}
      />
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
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-4">
          <button onClick={onHome} className="flex items-center gap-2 focus-ring rounded">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-background" strokeWidth={2} />
            </div>
            <span className="font-semibold tracking-tight text-foreground">Monolith</span>
          </button>
          <nav className="hidden md:flex items-center gap-1.5 text-xs text-moss">
            <span className="px-2 py-1 rounded-full bg-foreground/4">Search</span>
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
        <div className="flex items-center justify-center gap-3 mb-10 md:mb-14">
          <div className="relative w-11 h-11 rounded-2xl bg-foreground flex items-center justify-center">
            <Layers className="w-5 h-5 text-background" strokeWidth={2} />
            <div className="absolute -inset-1 rounded-2xl bg-accent/20 blur-md -z-10 pulse-line" />
          </div>
          <span className="text-2xl md:text-3xl font-semibold tracking-tight">Monolith</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-[-0.03em] leading-[1.05] text-balance">
          Search is just the beginning.
          <br />
          <span className="text-moss">Synthesize</span> the rest.
        </h1>
        <p className="mt-6 md:mt-8 text-lg md:text-xl text-moss max-w-2xl mx-auto leading-relaxed text-balance">
          A neural gateway that retrieves the web and choreographs it into
          instant, multi-dimensional understanding.
        </p>

        <div className="mt-12 md:mt-16">
          <SearchAperture query={query} setQuery={setQuery} onSearch={onSearch} loading={loading} />
        </div>

        {/* Suggestions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
          <span className="text-xs uppercase tracking-widest text-moss/70 mr-1">Try</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); onSearch(); }}
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass border border-foreground/8 hover:border-accent/40 text-sm text-foreground/75 hover:text-foreground transition-all focus-ring"
            >
              {s}
              <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all text-accent" strokeWidth={1.75} />
            </button>
          ))}
        </div>

        {/* Pillars */}
        <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
          {[
            { icon: Brain, title: "Core Synthesis", body: "An AI-distilled answer with cited sources, so you grasp the gist before you click." },
            { icon: Globe, title: "Web Stream", body: "High-fidelity cards for organic results, each expandable without leaving the flow." },
            { icon: Layers, title: "Knowledge Node", body: "An entity card surfacing facts, context, and the canonical reference." },
          ].map((p) => (
            <div key={p.title} className="glass rounded-2xl p-5 fade-rise">
              <p.icon className="w-5 h-5 text-accent mb-3" strokeWidth={1.75} />
              <h3 className="font-semibold tracking-tight mb-1.5">{p.title}</h3>
              <p className="text-sm text-moss leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3, 4].map((i) => (
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
    "Find the original source of this claim",
    "Compare these as a table",
    "What's the counterargument?",
    "Summarize the latest developments",
  ];
  return (
    <footer id="deep-search" className="mt-16 pt-10 border-t border-foreground/10">
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-widest text-moss">Deep Search</p>
        <p className="text-foreground/60 mt-1.5 text-sm">Multi-hop queries to go further.</p>
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
        Monolith · Spatial Synthesis Search · Built with real-time web retrieval
      </div>
    </footer>
  );
}