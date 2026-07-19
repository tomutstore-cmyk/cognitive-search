import React, { useState, useRef, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";

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
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) onSearch();
        }}
        className={`group relative flex items-center gap-2 rounded-full pl-5 pr-2 py-2 bg-card transition-all duration-300 ${
          focused
            ? "border-accent shadow-[0_8px_40px_-12px_rgba(255,122,41,0.3)]"
            : "border-foreground/12 shadow-[0_2px_20px_-12px_rgba(255,255,255,0.05)] hover:shadow-[0_4px_24px_-12px_rgba(255,255,255,0.08)]"
        } border`}
      >
        <Search
          className={`w-5 h-5 shrink-0 transition-colors duration-300 ${
            focused ? "text-accent" : "text-foreground/40"
          }`}
          strokeWidth={2}
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
          aria-label="Cari di web"
          placeholder={compact ? "Cari lagi…" : "Cari apa pun di web…"}
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground/35 text-base md:text-lg font-medium tracking-tight py-2"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Hapus"
            className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-foreground/40 hover:text-foreground focus-ring"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
        <button
          type="submit"
          disabled={!query.trim() || loading}
          aria-label="Cari"
          className="shrink-0 w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center disabled:opacity-35 disabled:cursor-not-allowed hover:bg-[#e85a1f] transition-all duration-300 focus-ring shadow-sm group-hover:scale-105"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <ArrowRight className="w-5 h-5" strokeWidth={2.25} />
          )}
        </button>
      </form>
    </div>
  );
}