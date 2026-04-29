export type TargetStyle =
  | "auto"
  | "scrollytelling"
  | "scroll-driven"
  | "3d-viewer"
  | "cinematic-storytelling";

export type Duration = "auto" | "5s" | "7s" | "10s" | "15s";

export type UseCaseKey =
  | "scrollytelling"
  | "scroll-driven"
  | "3d-viewer"
  | "cinematic-storytelling";

export interface GenerateRequest {
  objectOrScene?: string;
  imageBase64?: string;
  imageMediaType?: string;
  targetStyle?: TargetStyle;
  duration?: Duration;
  temperature?: number;
  variationMode?: boolean;
}

export interface UseCase {
  primary: UseCaseKey;
  rationale: string;
  secondary?: UseCaseKey | null;
}

export interface GenerateResponse {
  prompt: string;
  useCase: UseCase;
  metadata: {
    durationSeconds: number;
    cameraFormat: string;
    estimatedTokens: number;
  };
}

export const USE_CASE_LABELS: Record<UseCaseKey, string> = {
  scrollytelling: "Scrollytelling",
  "scroll-driven": "Scroll-Driven Animation",
  "3d-viewer": "3D Product Viewer",
  "cinematic-storytelling": "Cinematic Storytelling"
};
