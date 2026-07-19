import React from "react";
import { ExternalLink, Sprout } from "lucide-react";

// Ubah URL ini ke alamat RajaPanen yang resmi bila berbeda.
const RAJAPANEN_URL = "https://rajapanen.com";

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function RajaPanenResult({ query }) {
  return (
    <article className="fade-rise">
      <div className="relative rounded-2xl p-6 md:p-7 bg-card border border-foreground/[0.08] overflow-hidden">
        {/* Accent glow */}
        <div
          className="absolute -top-20 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,122,41,0.10), transparent 65%)" }}
        />

        <div className="relative">
          {/* Brand row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-[#e85a1f] flex items-center justify-center shadow-sm">
              <Sprout className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="text-xs text-foreground/45 font-medium tracking-wide uppercase">
                Hasil dari
              </div>
              <div className="text-sm font-semibold text-foreground tracking-tight">RajaPanen</div>
            </div>
          </div>

          {/* Heading */}
          <h3 className="text-xl md:text-2xl font-semibold leading-snug tracking-tight text-foreground">
            RajaPanen — Layanan untuk Petani Indonesia
          </h3>

          {/* Description */}
          <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground/65 max-w-2xl">
            RajaPanen adalah platform layanan yang mendukung petani dengan solusi pertanian modern.
            Temukan informasi, layanan, dan dukungan untuk meningkatkan hasil panen Anda.
          </p>

          {/* CTA */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={RAJAPANEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:bg-[#e85a1f] transition-colors focus-ring"
            >
              Kunjungi RajaPanen
              <ExternalLink className="w-4 h-4" strokeWidth={2} />
            </a>
            <span className="text-xs text-foreground/40">{hostOf(RAJAPANEN_URL)}</span>
          </div>

          {/* Query note */}
          {query && (
            <p className="mt-5 pt-4 border-t border-foreground/[0.06] text-xs text-foreground/40">
              Hasil pencarian untuk{" "}
              <span className="text-foreground/70 font-medium">"{query}"</span> diarahkan ke
              RajaPanen.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}