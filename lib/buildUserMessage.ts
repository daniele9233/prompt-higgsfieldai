import type { Duration, TargetStyle } from "./types";

interface BuildUserMessageOpts {
  objectOrScene?: string;
  imageBase64?: string;
  targetStyle?: TargetStyle;
  duration?: Duration;
  variationMode?: boolean;
}

export function buildUserMessage(opts: BuildUserMessageOpts): string {
  const parts: string[] = [];

  if (opts.imageBase64) {
    parts.push(
      "Reference visual is attached above. Study it carefully — colors, materials, mood, framing — and let it drive the creative direction."
    );
  }

  if (opts.objectOrScene && opts.objectOrScene.trim().length > 0) {
    parts.push(`Subject: ${opts.objectOrScene.trim()}`);
  } else {
    parts.push("Subject: derive the subject directly from the attached reference.");
  }

  if (opts.targetStyle && opts.targetStyle !== "auto") {
    parts.push(
      `Target landing-page use case: ${opts.targetStyle}. Build the timeline so it serves this use case naturally.`
    );
  } else {
    parts.push("Target landing-page use case: choose the one that best fits the subject.");
  }

  if (opts.duration && opts.duration !== "auto") {
    parts.push(`Duration: exactly ${opts.duration}.`);
  }

  if (opts.variationMode) {
    parts.push(
      "VARIATION MODE: produce a creatively distant angle from the most obvious treatment. Different camera language, different lighting register, different narrative entry point."
    );
  }

  parts.push(
    "Use the Seedance Ad Director skill to create a cinematic ad for this subject. Follow the system prompt rules exactly."
  );

  return parts.join("\n\n");
}
