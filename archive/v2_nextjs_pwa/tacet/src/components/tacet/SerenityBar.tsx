"use client";

interface SerenityBarProps {
  score: number;
  color: string;
  className?: string;
}

export function SerenityBar({ score, color, className = "" }: SerenityBarProps) {
  return (
    <div
      className={`h-1 w-full overflow-hidden rounded-full bg-white/10 ${className}`}
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  );
}
