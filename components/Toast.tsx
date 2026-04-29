"use client";

interface ToastProps {
  message: string;
  tone?: "error" | "info";
  onDismiss: () => void;
  onRetry?: () => void;
}

export function Toast({ message, tone = "error", onDismiss, onRetry }: ToastProps) {
  const palette =
    tone === "error"
      ? "border-red-900/60 bg-red-950/70 text-red-100"
      : "border-neutral-800 bg-ink-800 text-neutral-200";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
      <div
        className={`toast pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${palette}`}
        role="alert"
      >
        <span className="text-sm">{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-red-800/60 px-2 py-0.5 text-xs hover:bg-red-900/50"
          >
            Retry
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-neutral-400 hover:text-neutral-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
