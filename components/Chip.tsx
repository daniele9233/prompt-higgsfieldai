"use client";

interface ChipProps<T extends string> {
  value: T;
  label: string;
  selected: boolean;
  onSelect: (value: T) => void;
  disabled?: boolean;
}

export function Chip<T extends string>({
  value,
  label,
  selected,
  onSelect,
  disabled
}: ChipProps<T>) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(value)}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        selected
          ? "border-lime-accent bg-lime-accent/10 text-lime-accent"
          : "border-neutral-800 bg-ink-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
      ].join(" ")}
    >
      {label}
    </button>
  );
}
