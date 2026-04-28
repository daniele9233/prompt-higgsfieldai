"use client";

import { useCallback, useState } from "react";
import { Chip } from "@/components/Chip";
import { DropZone, type DroppedFile } from "@/components/DropZone";
import { PromptOutput } from "@/components/PromptOutput";
import { LoadingState } from "@/components/LoadingState";
import { Toast } from "@/components/Toast";
import {
  USE_CASE_LABELS,
  type Duration,
  type GenerateRequest,
  type GenerateResponse,
  type TargetStyle,
  type UseCaseKey
} from "@/lib/types";

const STYLE_OPTIONS: { value: TargetStyle; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "scrollytelling", label: "Scrollytelling" },
  { value: "scroll-driven", label: "Scroll-Driven" },
  { value: "3d-viewer", label: "3D Product Viewer" },
  { value: "cinematic-storytelling", label: "Cinematic Storytelling" }
];

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "5s", label: "5s" },
  { value: "7s", label: "7s" },
  { value: "10s", label: "10s" },
  { value: "15s", label: "15s" }
];

export default function Page() {
  const [file, setFile] = useState<DroppedFile | null>(null);
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<TargetStyle>("auto");
  const [duration, setDuration] = useState<Duration>("auto");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = (): string | null => {
    const hasImage = Boolean(file?.base64 && !file.isVideo);
    const hasText = description.trim().length > 0;
    if (!hasImage && !hasText) {
      return "Add a description or upload an image reference.";
    }
    return null;
  };

  const generate = useCallback(
    async (overrides?: { temperature?: number; variationMode?: boolean }) => {
      const v = validate();
      if (v) {
        setValidationError(v);
        return;
      }
      setValidationError(null);
      setError(null);
      setLoading(true);
      setResult(null);

      const body: GenerateRequest = {
        objectOrScene: description.trim() || undefined,
        imageBase64: file?.isVideo ? undefined : file?.base64 ?? undefined,
        imageMediaType: file?.isVideo ? undefined : file?.mediaType,
        targetStyle: style,
        duration,
        temperature: overrides?.temperature,
        variationMode: overrides?.variationMode
      };

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const json = (await res.json()) as
          | GenerateResponse
          | { error: string };
        if (!res.ok || "error" in json) {
          throw new Error(
            "error" in json ? json.error : `Request failed (${res.status}).`
          );
        }
        setResult(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [description, duration, file, style]
  );

  const onCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, [result]);

  const onRegenerate = useCallback(() => {
    void generate({ temperature: 1 });
  }, [generate]);

  const onVariation = useCallback(() => {
    void generate({ temperature: 1, variationMode: true });
  }, [generate]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-lime-accent" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Cinematic Ad Director
            </span>
          </div>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
            Single-take, timestamp-driven prompts for landing-page hero video.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
            Built for Higgsfield, Seedance and Kling. Drop a reference, describe
            the subject, pick a use case — get a cinematographer-grade prompt
            categorized for scrollytelling, scroll-driven, 3D viewer or
            cinematic storytelling.
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-6">
          <Section title="Reference">
            <DropZone
              value={file}
              onChange={setFile}
              onError={(m) => setError(m)}
            />
          </Section>

          <Section
            title="What is the object or scene?"
            hint={
              file?.base64 && !file.isVideo
                ? "Optional — image is attached"
                : "Required if no image"
            }
          >
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (validationError) setValidationError(null);
              }}
              rows={4}
              placeholder='e.g. "A can of Kinza Citrus on a Mediterranean beach" — or — "A high-tech running shoe building itself from raw materials"'
              className={[
                "w-full resize-none rounded-xl border bg-ink-800/60 p-4 text-sm leading-relaxed text-neutral-100",
                "placeholder:text-neutral-600 focus:outline-none focus:ring-1",
                validationError
                  ? "border-red-900/70 focus:border-red-700 focus:ring-red-700"
                  : "border-neutral-800 focus:border-neutral-600 focus:ring-neutral-700"
              ].join(" ")}
            />
            {validationError && (
              <p className="mt-1.5 text-xs text-red-400">{validationError}</p>
            )}
          </Section>

          <Section title="Target use case">
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  selected={style === opt.value}
                  onSelect={setStyle}
                />
              ))}
            </div>
          </Section>

          <Section title="Duration">
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  selected={duration === opt.value}
                  onSelect={setDuration}
                />
              ))}
            </div>
          </Section>

          <button
            type="button"
            onClick={() => void generate()}
            disabled={loading}
            className={[
              "group relative w-full rounded-xl px-5 py-4 text-sm font-semibold transition-all",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "bg-lime-accent text-ink-900 hover:bg-[#d4ff5e] active:bg-[#b6ee2c]",
              "shadow-lime-glow"
            ].join(" ")}
          >
            {loading ? "Generating…" : "Generate Cinematic Ad"}
          </button>
        </section>

        <section className="space-y-4">
          {!loading && !result && (
            <EmptyState />
          )}

          {loading && <LoadingState />}

          {!loading && result && (
            <>
              <UseCaseBadge
                primary={result.useCase.primary}
                secondary={result.useCase.secondary ?? null}
                rationale={result.useCase.rationale}
              />
              <PromptOutput prompt={result.prompt} />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onCopy}
                  className="rounded-lg border border-neutral-800 bg-ink-800 px-3 py-2 text-xs font-medium text-neutral-200 hover:border-neutral-700"
                >
                  {copied ? "Copied ✓" : "Copy to Clipboard"}
                </button>
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="rounded-lg border border-neutral-800 bg-ink-800 px-3 py-2 text-xs font-medium text-neutral-200 hover:border-neutral-700"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={onVariation}
                  className="rounded-lg border border-lime-accent/40 bg-lime-accent/10 px-3 py-2 text-xs font-medium text-lime-accent hover:bg-lime-accent/15"
                >
                  Variation
                </button>
                <div className="ml-auto font-mono text-[11px] text-neutral-500">
                  {result.metadata.cameraFormat} ·{" "}
                  {result.metadata.durationSeconds}s ·{" "}
                  {result.metadata.estimatedTokens} tokens
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {error && (
        <Toast
          message={error}
          tone="error"
          onDismiss={() => setError(null)}
          onRetry={() => {
            setError(null);
            void generate();
          }}
        />
      )}
    </main>
  );
}

function Section({
  title,
  hint,
  children
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
          {title}
        </label>
        {hint && (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-600">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-neutral-800 bg-ink-800/30 p-10 text-center">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-600">
        Output
      </div>
      <p className="mt-3 text-sm text-neutral-400">
        Your cinematic ad prompt will appear here.
      </p>
      <p className="mt-1 text-xs text-neutral-600">
        Camera Simulation · Lighting Style · timestamped timeline · use-case
        badge.
      </p>
    </div>
  );
}

function UseCaseBadge({
  primary,
  secondary,
  rationale
}: {
  primary: UseCaseKey;
  secondary: UseCaseKey | null;
  rationale: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-ink-800/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-lime-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-900">
          Best for: {USE_CASE_LABELS[primary]}
        </span>
        {secondary && (
          <span className="rounded-full border border-neutral-700 bg-ink-700 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-neutral-300">
            Also: {USE_CASE_LABELS[secondary]}
          </span>
        )}
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-neutral-300">
        {rationale}
      </p>
    </div>
  );
}
