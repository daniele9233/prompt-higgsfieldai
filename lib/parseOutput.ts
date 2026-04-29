import type { UseCase, UseCaseKey } from "./types";

const VALID_USE_CASES: UseCaseKey[] = [
  "scrollytelling",
  "scroll-driven",
  "3d-viewer",
  "cinematic-storytelling"
];

const OPEN_MARKER = "<<<USE_CASE_JSON>>>";
const CLOSE_MARKER = "<<<END_USE_CASE_JSON>>>";

export interface ParsedOutput {
  prompt: string;
  useCase: UseCase;
  durationSeconds: number;
  cameraFormat: string;
}

interface RawJsonTail {
  primary?: string;
  rationale?: string;
  secondary?: string | null;
  durationSeconds?: number;
  cameraFormat?: string;
}

export function parseModelOutput(raw: string): ParsedOutput {
  const openIdx = raw.indexOf(OPEN_MARKER);
  const closeIdx = raw.indexOf(CLOSE_MARKER);

  let promptPart = raw.trim();
  let parsed: RawJsonTail | null = null;

  if (openIdx !== -1 && closeIdx !== -1 && closeIdx > openIdx) {
    promptPart = raw.slice(0, openIdx).trim();
    const jsonStr = raw.slice(openIdx + OPEN_MARKER.length, closeIdx).trim();
    try {
      parsed = JSON.parse(jsonStr) as RawJsonTail;
    } catch {
      parsed = null;
    }
  }

  const fallback = inferUseCaseFromText(promptPart);

  const primary: UseCaseKey =
    parsed?.primary && (VALID_USE_CASES as string[]).includes(parsed.primary)
      ? (parsed.primary as UseCaseKey)
      : fallback.primary;

  const secondary: UseCaseKey | null =
    parsed?.secondary && (VALID_USE_CASES as string[]).includes(parsed.secondary)
      ? (parsed.secondary as UseCaseKey)
      : fallback.secondary ?? null;

  const rationale =
    parsed?.rationale && parsed.rationale.trim().length > 0
      ? parsed.rationale.trim()
      : fallback.rationale;

  const durationSeconds =
    typeof parsed?.durationSeconds === "number" && parsed.durationSeconds > 0
      ? Math.round(parsed.durationSeconds)
      : inferDurationFromText(promptPart);

  const cameraFormat =
    parsed?.cameraFormat && parsed.cameraFormat.trim().length > 0
      ? parsed.cameraFormat.trim()
      : "65mm IMAX anamorphic";

  return {
    prompt: promptPart,
    useCase: { primary, rationale, secondary },
    durationSeconds,
    cameraFormat
  };
}

interface HeuristicResult {
  primary: UseCaseKey;
  secondary: UseCaseKey | null;
  rationale: string;
}

export function inferUseCaseFromText(text: string): HeuristicResult {
  const lower = text.toLowerCase();

  const scores: Record<UseCaseKey, number> = {
    scrollytelling: 0,
    "scroll-driven": 0,
    "3d-viewer": 0,
    "cinematic-storytelling": 0
  };

  const hits = (patterns: RegExp[]) =>
    patterns.reduce((acc, p) => acc + (p.test(lower) ? 1 : 0), 0);

  scores.scrollytelling += hits([
    /\bbuilds itself\b/,
    /\bassembles\b/,
    /\btransforms\b/,
    /\bstage\b/,
    /\bmaterialis[ez]es?\b/,
    /\bbuild-?up\b/,
    /\bmorphs?\b/
  ]);

  scores["scroll-driven"] += hits([
    /\bspirals?\b/,
    /\bdives?\b/,
    /\bpulls? back continuously\b/,
    /\bpush-?in\b/,
    /\bpull-?out\b/,
    /\bone continuous dive\b/,
    /\bcontinuous (descent|ascent|fall)\b/
  ]);

  scores["3d-viewer"] += hits([
    /360°|360 degrees|three-?sixty/,
    /\borbits?\b/,
    /\brotates? around\b/,
    /\bstatic object\b/,
    /\bmacro detail\b/,
    /\bturntable\b/
  ]);

  scores["cinematic-storytelling"] += hits([
    /\bhand enters frame\b/,
    /\bcharacter\b/,
    /\benvironment\b/,
    /\bunderwater\b/,
    /\bshore\b/,
    /\bgolden hour\b/,
    /\beclipse\b/,
    /\bweather\b/
  ]);

  let primary: UseCaseKey = "cinematic-storytelling";
  let topScore = -1;
  let tie = false;

  for (const key of VALID_USE_CASES) {
    const s = scores[key];
    if (s > topScore) {
      primary = key;
      topScore = s;
      tie = false;
    } else if (s === topScore && s > 0) {
      tie = true;
    }
  }

  if (topScore <= 0 || tie) {
    primary = "cinematic-storytelling";
  }

  let secondary: UseCaseKey | null = null;
  let secondScore = -1;
  for (const key of VALID_USE_CASES) {
    if (key === primary) continue;
    if (scores[key] > secondScore && scores[key] > 0) {
      secondary = key;
      secondScore = scores[key];
    }
  }

  const rationaleByCase: Record<UseCaseKey, string> = {
    scrollytelling:
      "Multi-stage build-up across distinct material phases naturally maps to scroll-triggered reveals.",
    "scroll-driven":
      "One continuous camera move sustains a hero background driven by scroll position.",
    "3d-viewer":
      "Orbital camera around a static, hyper-detailed subject suits an interactive product viewer.",
    "cinematic-storytelling":
      "Environmental opening that arrives at the product reads as emotion-led brand storytelling."
  };

  return { primary, secondary, rationale: rationaleByCase[primary] };
}

function inferDurationFromText(text: string): number {
  const matches = Array.from(text.matchAll(/(\d{2}):(\d{2}(?:\.\d+)?)\s*[–\-]\s*(\d{2}):(\d{2}(?:\.\d+)?)/g));
  if (matches.length === 0) return 7;
  let maxEnd = 0;
  for (const m of matches) {
    const minutes = parseInt(m[3], 10);
    const seconds = parseFloat(m[4]);
    const total = minutes * 60 + seconds;
    if (total > maxEnd) maxEnd = total;
  }
  if (maxEnd <= 0) return 7;
  return Math.round(maxEnd);
}
