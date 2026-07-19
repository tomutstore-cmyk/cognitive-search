import React, { useState } from "react";
import { ExternalLink, ChevronDown } from "lucide-react";

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function pathOf(url) {
  try {
    const u = new URL(url);
    const p = u.pathname.replace(/\/+$/, "");
    return p || "/";
  } catch {
    return "";
  }
}

export default function ResultCard({ result, index = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const host = hostOf(result.url);
  const path = pathOf(result.url);
  const canExpand = !!result.snippet && result.snippet.length > 140;

  return (
    <article
      className="group relative fade-rise"
      style={{ animationDelay: `${Math.min(index * 60, 420)}ms` }}
    >
      <div className="relative rounded-xl px-3 py-5 -mx-1 transition-colors duration-300 hover:bg-foreground/[0.025]">
        {/* Hover accent rail */}
        <span className="absolute left-0 top-5 bottom-5 w-px rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Source row */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-4 h-4 rounded-full bg-foreground/8 flex items-center justify-center text-[9px] font-semibold text-foreground/55 shrink-0">
            {host?.[0]?.toUpperCase() || "•"}
          </div>
          <span className="text-xs font-medium text-foreground/55 truncate max-w-[40%]">
            {host}
          </span>
          <span className="text-foreground/25 text-xs shrink-0">›</span>
          <span className="text-xs text-foreground/40 truncate">{path}</span>
        </div>

        {/* Title */}
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[1.05rem] md:text-[1.15rem] font-medium leading-snug tracking-tight text-foreground hover:text-accent transition-colors focus-ring rounded"
        >
          {result.title}
        </a>

        {/* Snippet */}
        {result.snippet && (
          <p
            className={`mt-1.5 text-[0.925rem] leading-relaxed text-foreground/60 ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            {result.snippet}
          </p>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-5">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent/85 hover:text-accent transition-colors focus-ring rounded"
          >
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
            Kunjungi sumber
          </a>
          {canExpand && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-foreground/40 hover:text-foreground transition-colors focus-ring rounded"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  expanded ? "rotate-180" : ""
                }`}
                strokeWidth={1.75}
              />
              {expanded ? "Sembunyikan" : "Selengkapnya"}
            </button>
          )}
        </div>
      </div>

      <div className="h-px bg-foreground/[0.06]" />
    </article>
  );
}