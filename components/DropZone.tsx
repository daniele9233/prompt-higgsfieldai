"use client";

import { useCallback, useRef, useState } from "react";

const ACCEPTED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime"
];
const ACCEPTED_EXT = ".jpg,.jpeg,.png,.webp,.mp4,.mov";
const MAX_BYTES = 10 * 1024 * 1024;

export interface DroppedFile {
  file: File;
  previewUrl: string;
  isVideo: boolean;
  base64: string | null;
  mediaType: string;
}

interface DropZoneProps {
  value: DroppedFile | null;
  onChange: (file: DroppedFile | null) => void;
  onError: (message: string) => void;
}

export function DropZone({ value, onChange, onError }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        onError("Unsupported file type. Use JPG, PNG, WEBP, MP4, or MOV.");
        return;
      }
      if (file.size > MAX_BYTES) {
        onError("File too large (max 10 MB).");
        return;
      }

      const isVideo = file.type.startsWith("video/");
      const previewUrl = URL.createObjectURL(file);

      let base64: string | null = null;
      if (!isVideo) {
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      }

      onChange({
        file,
        previewUrl,
        isVideo,
        base64,
        mediaType: file.type
      });
    },
    [onChange, onError]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) void handleFile(f);
    },
    [handleFile]
  );

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) void handleFile(f);
      e.target.value = "";
    },
    [handleFile]
  );

  const clear = useCallback(() => {
    if (value?.previewUrl) URL.revokeObjectURL(value.previewUrl);
    onChange(null);
  }, [onChange, value]);

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-ink-800">
        <div className="flex items-center gap-4 p-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-ink-700">
            {value.isVideo ? (
              <video
                src={value.previewUrl}
                muted
                loop
                playsInline
                autoPlay
                className="h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value.previewUrl}
                alt="reference"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-neutral-200">
              {value.file.name}
            </div>
            <div className="mt-0.5 text-xs text-neutral-500">
              {(value.file.size / 1024 / 1024).toFixed(2)} MB ·{" "}
              {value.isVideo ? "video preview only" : "sent as reference"}
            </div>
            {value.isVideo && (
              <div className="mt-1 text-[11px] text-neutral-500">
                Video files are previewed locally. Add a written description so
                the model has context.
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={clear}
            className="rounded-md border border-neutral-800 px-2.5 py-1 text-xs text-neutral-400 hover:border-neutral-700 hover:text-neutral-100"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={[
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed",
        "px-6 py-10 text-center transition-colors",
        isDragging
          ? "border-lime-accent bg-lime-accent/5"
          : "border-neutral-800 bg-ink-800/50 hover:border-neutral-700 hover:bg-ink-800"
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXT}
        onChange={onPick}
        className="hidden"
      />
      <div className="text-sm text-neutral-300">
        Drop an image or video reference
      </div>
      <div className="mt-1 text-xs text-neutral-500">
        JPG · PNG · WEBP · MP4 · MOV — up to 10 MB · optional
      </div>
    </div>
  );
}
