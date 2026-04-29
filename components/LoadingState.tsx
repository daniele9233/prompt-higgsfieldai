"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Loading the IMAX reel…",
  "Setting the key light…",
  "Calling the gaffer…",
  "Mounting the anamorphic lens…",
  "Locking the gimbal…",
  "Triggering the lens flares…",
  "Cueing the speed ramp…",
  "Color-grading the timeline…",
  "Rolling sound… just kidding, no audio.",
  "Slating the single take…"
];

export function LoadingState() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % MESSAGES.length);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border border-neutral-800 bg-ink-800/50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse-soft rounded-full bg-lime-accent" />
        <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
          {MESSAGES[idx]}
        </span>
      </div>
      <div className="space-y-2">
        <SkeletonRow w="40%" />
        <SkeletonRow w="92%" />
        <SkeletonRow w="86%" />
        <SkeletonRow w="78%" />
        <div className="h-3" />
        <SkeletonRow w="22%" tone="lime" />
        <SkeletonRow w="94%" />
        <SkeletonRow w="88%" />
        <div className="h-3" />
        <SkeletonRow w="24%" tone="lime" />
        <SkeletonRow w="90%" />
        <SkeletonRow w="70%" />
      </div>
    </div>
  );
}

function SkeletonRow({ w, tone = "neutral" }: { w: string; tone?: "neutral" | "lime" }) {
  return (
    <div
      className={[
        "shimmer h-3 rounded-md",
        tone === "lime" ? "opacity-60" : ""
      ].join(" ")}
      style={{ width: w }}
    />
  );
}
