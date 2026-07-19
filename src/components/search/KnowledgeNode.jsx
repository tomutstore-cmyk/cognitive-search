import React from "react";
import { Compass, ExternalLink } from "lucide-react";

export default function KnowledgeNode({ knowledge, loading }) {
  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 fade-rise">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-4 h-4 text-accent" strokeWidth={1.75} />
          <span className="text-xs font-semibold uppercase tracking-wider text-moss">
            Knowledge Node
          </span>
        </div>
        <div className="space-y-2.5">
          <div className="h-5 rounded shimmer w-2/3" />
          <div className="h-3 rounded shimmer" />
          <div className="h-3 rounded shimmer w-11/12" />
        </div>
      </div>
    );
  }

  if (!knowledge || (!knowledge.entity && !knowledge.description)) return null;

  return (
    <div className="glass rounded-2xl p-5 fade-rise">
      <div className="flex items-center gap-2 mb-3">
        <Compass className="w-4 h-4 text-accent" strokeWidth={1.75} />
        <span className="text-xs font-semibold uppercase tracking-wider text-moss">
          Knowledge Node
        </span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground mb-2">
        {knowledge.entity}
      </h3>
      {knowledge.description && (
        <p className="text-sm leading-relaxed text-foreground/70 mb-4">
          {knowledge.description}
        </p>
      )}
      {Array.isArray(knowledge.facts) && knowledge.facts.length > 0 && (
        <ul className="space-y-2.5">
          {knowledge.facts.slice(0, 5).map((f, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-foreground/75">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-accent shrink-0" />
              <span className="leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
      )}
      {knowledge.url && (
        <a
          href={knowledge.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:gap-2.5 transition-all focus-ring rounded"
        >
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
          Entity source
        </a>
      )}
    </div>
  );
}