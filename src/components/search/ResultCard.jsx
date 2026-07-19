import React, { useState } from "react";
import { ExternalLink, ChevronDown } from "lucide-react";

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function ResultCard({ result, index = 0 }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className="group relative fade-rise"
      style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
    >
      <div className="relative rounded-xl p-5 transition-all duration-300 hover:bg-foreground/[0.03] hover:shadow-[0_2px_24px_-12px_rgba(15,17,16,0.18)]">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-full bg-foreground/8 flex items-center justify-center text-[10px] font-semibold text-moss">
            {hostOf(result.url)?.[0]?.toUpperCase() || "•"}
          </div>
          <span className="text-xs text-moss truncate">{hostOf(result.url)}</span>
          <span className="text-xs text-foreground/25">·</span>
          <span className="text-xs text-moss/70">
            {result.source || "Web"}
          </span>
        </div>

        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-lg md:text-xl font-medium leading-snug text-foreground hover:text-accent transition-colors tracking-tight focus-ring rounded"
        >
          {result.title}
        </a>

        <p
          className={`mt-2 text-[0.9375rem] leading-relaxed text-foreground/65 ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {result.snippet}
        </p>

        <div className="mt-3 flex items-center gap-3">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:gap-2.5 transition-all focus-ring rounded"
          >
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
            Visit source
          </a>
          {result.snippet && result.snippet.length > 160 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-moss hover:text-foreground transition-colors focus-ring rounded"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                strokeWidth={1.75}
              />
              {expanded ? "Less" : "More"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}