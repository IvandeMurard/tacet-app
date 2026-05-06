"use client";

interface TierBadgeProps {
  label: string;
  color: string;
  className?: string;
}

export function TierBadge({ label, color, className = "" }: TierBadgeProps) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold tracking-widest uppercase ${className}`}
      style={{
        backgroundColor: `${color}18`,
        color,
        borderColor: `${color}33`,
      }}
    >
      {label}
    </span>
  );
}
