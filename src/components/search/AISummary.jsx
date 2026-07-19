import React from "react";
import { Sparkles, Quote } from "lucide-react";

export default function AISummary({ summary, citations = [], loading }) {
  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 fade-rise">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.75} />
          <span className="text-xs font-semibold uppercase tracking-wider text-moss">
            Core Synthesis
          </span>
        </div>
        <div className="space-y-3">
          <div className="h-4 rounded shimmer" />
          <div className="h-4 rounded shimmer w-11/12" />
          <div className="h-4 rounded shimmer w-9/12" />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="glass rounded-2xl p-6 fade-rise">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.75} />
        <span className="text-xs font-semibold uppercase tracking-wider text-moss">
          Core Synthesis
        </span>
      </div>
      <p className="text-[1.0625rem] leading-relaxed text-foreground/85 text-balance">
        {summary}
      </p>
      {citations.length > 0 && (
        <div className="mt-5 pt-4 border-t border-foreground/8 flex flex-wrap gap-2">
          {citations.slice(0, 6).map((c, i) => (
            <a
              key={i}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-moss hover:text-accent transition-colors px-2.5 py-1.5 rounded-full bg-foreground/4 hover:bg-accent/8 focus-ring"
            >
              <Quote className="w-3 h-3" strokeWidth={1.75} />
              <span className="max-w-[140px] truncate">{c.source || new URL(c.url).hostname}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}