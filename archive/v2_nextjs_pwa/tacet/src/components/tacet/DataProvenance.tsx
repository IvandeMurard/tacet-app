"use client";

import { DATA_YEAR } from "@/lib/constants";

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
