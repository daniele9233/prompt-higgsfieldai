"use client";

import { useMemo } from "react";

interface PromptOutputProps {
  prompt: string;
}

const TIMESTAMP_RE =
  /^(\d{2}:\d{2}(?:\.\d+)?\s*[–\-]\s*\d{2}:\d{2}(?:\.\d+)?)(\s+[·Σ—\-])?\s*(.*)$/;
const HEADER_RE = /^(Camera Simulation:|Lighting Style:)/;

export function PromptOutput({ prompt }: PromptOutputProps) {
  const lines = useMemo(() => prompt.split("\n"), [prompt]);

  return (
    <pre className="prompt-scroll max-h-[640px] overflow-auto rounded-xl border border-neutral-800 bg-ink-800/60 p-5 font-mono text-[13px] leading-relaxed text-neutral-300">
      <code className="block">
        {lines.map((line, idx) => (
          <RenderLine key={idx} line={line} />
        ))}
      </code>
    </pre>
  );
}

function RenderLine({ line }: { line: string }) {
  if (line.length === 0) {
    return <span className="prompt-line">{"​"}</span>;
  }

  const headerMatch = line.match(HEADER_RE);
  if (headerMatch) {
    const rest = line.slice(headerMatch[0].length);
    return (
      <span className="prompt-line">
        <span className="prompt-header">{headerMatch[0]}</span>
        {rest}
      </span>
    );
  }

  const tsMatch = line.match(TIMESTAMP_RE);
  if (tsMatch) {
    const [, ts, marker, title] = tsMatch;
    return (
      <span className="prompt-line">
        <span className="prompt-timestamp">{ts}</span>
        {marker && <span className="prompt-marker">{marker}</span>}
        {title ? ` ${title}` : ""}
      </span>
    );
  }

  return <span className="prompt-line">{line}</span>;
}
