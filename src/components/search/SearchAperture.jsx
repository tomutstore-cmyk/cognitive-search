import React, { useState, useRef, useEffect } from "react";
import { Search, Sparkles, X } from "lucide-react";

export default function SearchAperture({
  query,
  setQuery,
  onSearch,
  loading,
  compact = false,
}) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!compact) inputRef.current?.focus();
  }, [compact]);

  const handleKey = (e) => {
    if (e.key === "Enter" && query.trim()) onSearch();
    if (e.key === "Escape") inputRef.current?.blur();
  };

  return (
    <div className={`w-full ${compact ? "max-w-3xl" : "max-w-3xl"} mx-auto`}>
      <div
        className={`relative transition-all duration-500 ease-out ${
          focused ? "aperture-glow-active" : "aperture-glow"
        }`}
      >
        {/* The living underline */}
        <div
          className={`absolute left-0 right-0 -bottom-px h-px transition-all duration-700 ${
            focused ? "bg-accent opacity-100" : "bg-foreground/15 opacity-60"
          }`}
        />
        <div
          className={`absolute left-0 right-0 -bottom-px h-px bg-accent transition-all duration-700 ${
            focused ? "opacity-90 scale-x-100" : "opacity-0 scale-x-0"
          } origin-left`}
          style={{ transformOrigin: "left" }}
        />

        <div className="flex items-center gap-4 px-6 py-5">
          <Search
            className={`w-5 h-5 shrink-0 transition-colors duration-300 ${
              focused ? "text-accent" : "text-foreground/40"
            }`}
            strokeWidth={1.75}
          />
          <input
            id="aperture-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Search the web"
            placeholder={
              compact ? "Search again…" : "Ask anything. Synthesize everything."
            }
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground/35 text-lg md:text-xl font-medium tracking-tight"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear query"
              className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-foreground/40 hover:text-foreground focus-ring"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
          <button
            onClick={() => query.trim() && onSearch()}
            disabled={!query.trim() || loading}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium disabled:opacity-40 hover:bg-accent hover:text-accent-foreground transition-all duration-300 focus-ring"
          >
            <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" strokeWidth={1.75} />
            <span className="hidden sm:inline">Synthesize</span>
          </button>
        </div>
      </div>
    </div>
  );
}