"use client";

const DATA_YEAR = 2024;

interface DataProvenanceProps {
  className?: string;
}

export function DataProvenance({ className = "" }: DataProvenanceProps) {
  return (
    <p className={`text-[10px] leading-relaxed text-white/25 ${className}`}>
      Bruitparif · PPBE {DATA_YEAR}
    </p>
  );
}
