import React from "react";
import { Bookmark, X, ExternalLink } from "lucide-react";

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function ResearchBucket({ items, onRemove, onClear, open, setOpen }) {
  return (
    <>
      {/* Bucket toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close research bucket" : "Open research bucket"}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full glass border border-foreground/10 shadow-lg transition-all duration-300 hover:border-accent/40 focus-ring ${
          open ? "scale-95" : ""
        }`}
      >
        <Bookmark className="w-4 h-4 text-accent" strokeWidth={1.75} />
        <span className="text-sm font-medium text-foreground">Bucket</span>
        {items.length > 0 && (
          <span className="min-w-5 h-5 px-1.5 rounded-full bg-accent text-accent-foreground text-[11px] font-semibold flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {/* Bucket panel */}
      <div
        className={`fixed bottom-24 right-6 z-40 w-80 max-w-[calc(100vw-3rem)] glass rounded-2xl border border-foreground/10 shadow-2xl transition-all duration-300 origin-bottom-right ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/8">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-accent" strokeWidth={1.75} />
            <span className="text-sm font-semibold text-foreground">Research Bucket</span>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-moss hover:text-accent transition-colors focus-ring rounded"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-1 rounded-md hover:bg-foreground/8 text-moss transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="text-sm text-moss text-center py-8 px-4 leading-relaxed">
              Save results here to weave them into your research later.
            </p>
          ) : (
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <div className="group flex items-start gap-2 rounded-lg p-2.5 hover:bg-foreground/4 transition-colors">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-0 focus-ring rounded"
                    >
                      <span className="text-xs text-moss block truncate">
                        {hostOf(item.url)}
                      </span>
                      <span className="text-sm text-foreground/85 line-clamp-2 block leading-snug">
                        {item.title}
                      </span>
                    </a>
                    <div className="flex flex-col gap-1">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open"
                        className="p-1.5 rounded-md text-moss hover:text-accent hover:bg-foreground/8 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </a>
                      <button
                        onClick={() => onRemove(item.id)}
                        aria-label="Remove"
                        className="p-1.5 rounded-md text-moss hover:text-accent hover:bg-foreground/8 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}