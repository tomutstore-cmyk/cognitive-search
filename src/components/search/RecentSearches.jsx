import React from "react";
import { Clock, X, ArrowUpRight } from "lucide-react";

export default function RecentSearches({ items, onPick, onClear, onRemove, open, setOpen }) {
  return (
    <>
      {/* Blade toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Hide recent searches" : "Show recent searches"}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 py-4 px-2 rounded-r-2xl glass border-l-0 transition-all duration-500 focus-ring ${
          open ? "translate-x-64" : "translate-x-0"
        }`}
      >
        <Clock
          className={`w-4 h-4 transition-colors ${open ? "text-accent" : "text-moss"}`}
          strokeWidth={1.75}
        />
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-moss"
          style={{ writingMode: "vertical-rl" }}
        >
          History
        </span>
      </button>

      {/* Blade panel */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-30 w-64 glass border-r border-foreground/8 transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 pt-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-moss">
              Cognitive History
            </h2>
            {items.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-moss hover:text-accent transition-colors focus-ring rounded"
              >
                Clear
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-moss/60" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-moss leading-relaxed">
                Your inquiries will echo here.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-1">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-2 rounded-lg hover:bg-foreground/4 transition-colors"
                >
                  <button
                    onClick={() => onPick(item.query)}
                    className="flex-1 text-left px-3 py-2.5 focus-ring rounded-lg"
                  >
                    <span className="text-[11px] text-moss/60 block">
                      {i === 0 ? "Latest" : `#${items.length - i}`}
                    </span>
                    <span className="text-sm text-foreground/85 line-clamp-1 block">
                      {item.query}
                    </span>
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    aria-label="Remove search"
                    className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 rounded-md hover:bg-foreground/8 text-moss hover:text-accent transition-all"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <a
            href="#deep-search"
            className="mt-4 pt-4 border-t border-foreground/8 flex items-center gap-1.5 text-xs text-moss hover:text-accent transition-colors focus-ring rounded"
          >
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            Deep search
          </a>
        </div>
      </aside>
    </>
  );
}