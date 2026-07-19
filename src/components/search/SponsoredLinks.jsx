import React from "react";
import { ExternalLink } from "lucide-react";

// Tautan sponsor yang ditampilkan di paling atas hasil pencarian.
// Hanya untuk tautan yang sah (bukan perjudian/ilegal).
const SPONSORED = [
  {
    title: "Currican — Extreme Sport Pesca",
    url: "https://currican.extremesportpesca.com/",
    host: "currican.extremesportpesca.com",
  },
];

export default function SponsoredLinks() {
  return (
    <section className="mb-7 fade-rise" aria-label="Hasil sponsor">
      <div className="flex items-center gap-2 px-1 mb-2.5">
        <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold">
          Sponsor
        </span>
        <span className="h-px flex-1 bg-foreground/[0.06]" />
      </div>
      <div className="space-y-2">
        {SPONSORED.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="group flex items-start gap-3 rounded-xl p-3.5 bg-card border border-foreground/[0.08] hover:border-accent/40 transition-colors focus-ring"
          >
            <div className="w-8 h-8 rounded-lg bg-foreground/6 flex items-center justify-center text-xs font-semibold text-foreground/60 shrink-0">
              {s.host?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-foreground/50 truncate">{s.host}</div>
              <div className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate">
                {s.title}
              </div>
            </div>
            <ExternalLink
              className="w-4 h-4 text-foreground/35 group-hover:text-accent transition-colors shrink-0 mt-1"
              strokeWidth={1.75}
            />
          </a>
        ))}
      </div>
    </section>
  );
}