import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SEEDANCE_AD_DIRECTOR_SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { buildUserMessage } from "@/lib/buildUserMessage";
import { parseModelOutput } from "@/lib/parseOutput";
import type { GenerateRequest, GenerateResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";

const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Server misconfigured: ANTHROPIC_API_KEY is not set." },
      { status: 500 }
    );
  }

  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const objectOrScene = body.objectOrScene?.trim();
  const hasImage = Boolean(body.imageBase64 && body.imageMediaType);

  if (!objectOrScene && !hasImage) {
    return NextResponse.json(
      { error: "Provide either a description or a reference image." },
      { status: 400 }
    );
  }

  if (
    hasImage &&
    body.imageMediaType &&
    !ALLOWED_MEDIA_TYPES.has(body.imageMediaType)
  ) {
    return NextResponse.json(
      { error: `Unsupported image media type: ${body.imageMediaType}` },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userText = buildUserMessage({
    objectOrScene,
    imageBase64: body.imageBase64,
    targetStyle: body.targetStyle,
    duration: body.duration,
    variationMode: body.variationMode
  });

  const userContent: Anthropic.Messages.ContentBlockParam[] = [];

  if (hasImage && body.imageBase64 && body.imageMediaType) {
    const data = body.imageBase64.includes(",")
      ? body.imageBase64.split(",")[1]
      : body.imageBase64;
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: body.imageMediaType as
          | "image/jpeg"
          | "image/png"
          | "image/webp"
          | "image/gif",
        data
      }
    });
  }

  userContent.push({ type: "text", text: userText });

  try {
    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2500,
      temperature: clampTemperature(body.temperature ?? 0.95),
      system: SEEDANCE_AD_DIRECTOR_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }]
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === "text"
    );
    const raw = textBlock?.text ?? "";

    if (!raw) {
      return NextResponse.json(
        { error: "Empty response from model." },
        { status: 502 }
      );
    }

    const parsed = parseModelOutput(raw);

    const payload: GenerateResponse = {
      prompt: parsed.prompt,
      useCase: parsed.useCase,
      metadata: {
        durationSeconds: parsed.durationSeconds,
        cameraFormat: parsed.cameraFormat,
        estimatedTokens:
          (response.usage?.input_tokens ?? 0) +
          (response.usage?.output_tokens ?? 0)
      }
    };

    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status =
      err instanceof Anthropic.APIError ? err.status ?? 502 : 502;
    return NextResponse.json(
      { error: `Anthropic API error: ${message}` },
      { status }
    );
  }
}

function clampTemperature(t: number): number {
  if (Number.isNaN(t)) return 0.95;
  return Math.max(0, Math.min(1, t));
}
