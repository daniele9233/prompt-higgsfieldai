# Cinematic Ad Director

A minimal Next.js app that acts as an **expert prompt engineer** for AI video
generation models (Higgsfield.ai, Seedance 2.0, Kling 3.0). It produces
single-take, timestamp-driven cinematic prompts and tags each output with the
landing-page use case it serves best: **scrollytelling**, **scroll-driven
animation**, **3D product viewer**, or **cinematic storytelling**.

The full product spec lives in [`CINEMATIC_AD_DIRECTOR.md`](./CINEMATIC_AD_DIRECTOR.md).

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS (dark-mode forced)
- Anthropic SDK — defaults to `claude-opus-4-7` (latest Opus, highest quality
  for long creative prompts). Switch to a smaller model via `ANTHROPIC_MODEL`.
- No database, no auth — local React state only.

## Getting started

```bash
pnpm install        # or: npm install
cp .env.example .env.local
# edit .env.local and paste your ANTHROPIC_API_KEY

pnpm dev            # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

1. The user drops an optional reference (image or video) and/or describes the
   subject. They can pick a target use case and duration, or leave both on
   `Auto`.
2. The browser sends a JSON payload to `POST /api/generate`.
3. The API attaches the system prompt from
   [`lib/systemPrompt.ts`](./lib/systemPrompt.ts) (a byte-exact copy of section 7
   of the spec — do not edit) and calls the Anthropic Messages API.
4. The model returns a cinematographic prompt followed by a JSON tail bracketed
   by `<<<USE_CASE_JSON>>>` / `<<<END_USE_CASE_JSON>>>`. The API parses both
   pieces. If JSON parsing fails it falls back to keyword heuristics in
   [`lib/parseOutput.ts`](./lib/parseOutput.ts).
5. The UI renders the prompt with a custom syntax highlighter for headers,
   timestamps and section markers, plus a use-case badge with rationale.

## API

`POST /api/generate`

Request body — all fields optional except that `objectOrScene` **or**
`imageBase64` must be present:

```ts
{
  objectOrScene?: string;
  imageBase64?: string;          // data URL or raw base64
  imageMediaType?: string;       // image/jpeg | image/png | image/webp | image/gif
  targetStyle?: "auto" | "scrollytelling" | "scroll-driven" | "3d-viewer" | "cinematic-storytelling";
  duration?: "auto" | "5s" | "7s" | "10s" | "15s";
  temperature?: number;          // 0–1, default 0.95
  variationMode?: boolean;       // pushes the model toward an unusual angle
}
```

Response body:

```ts
{
  prompt: string;
  useCase: {
    primary: "scrollytelling" | "scroll-driven" | "3d-viewer" | "cinematic-storytelling";
    rationale: string;
    secondary?: string | null;
  };
  metadata: {
    durationSeconds: number;
    cameraFormat: string;
    estimatedTokens: number;
  };
}
```

## Notes on uploads

- Images (JPG / PNG / WEBP) are sent to the Vision-capable model as base64.
- Videos (MP4 / MOV) are previewed locally only. Provide a written description
  alongside the video — the model never receives the video bytes.
- Client-side upload limit: 10 MB. If you deploy on Vercel and need larger
  payloads, upload to object storage and pass a URL instead.

## Project layout

```
app/
  api/generate/route.ts   # /api/generate handler
  layout.tsx              # root layout, fonts, dark mode
  page.tsx                # main UI
  globals.css             # Tailwind + custom syntax highlighting
components/
  Chip.tsx
  DropZone.tsx
  LoadingState.tsx
  PromptOutput.tsx
  Toast.tsx
lib/
  buildUserMessage.ts     # serializes the user inputs into the user message
  parseOutput.ts          # JSON-tail parser + keyword heuristics fallback
  systemPrompt.ts         # SEEDANCE_AD_DIRECTOR_SYSTEM_PROMPT (do not edit)
  types.ts                # shared request/response types
```

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Add `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`) in the project
   environment variables.
4. Deploy. The route handler runs on the Node runtime
   (`runtime = "nodejs"`).

## Roadmap (v2)

- Local history of generated prompts (localStorage)
- Export as `.txt` / `.json`
- Saveable presets (style + duration + tone)
- Direct integration with Higgsfield / Kling APIs
- "Ken Burns" mode for animating a single still image
- Italian-localized prompt variant
