"use client";

import { useState, useEffect } from "react";
import type { EnrichmentRequest, EnrichmentResult } from "@/types/enrichment";

const enabled = process.env.NEXT_PUBLIC_ENABLE_ENRICHMENT === "true";

export function useEnrichment(request: EnrichmentRequest | null): {
  enrichment: EnrichmentResult | null;
  isLoading: boolean;
} {
  const [enrichment, setEnrichment] = useState<EnrichmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !request) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch("/api/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
      .then((res) => res.json() as Promise<EnrichmentResult>)
      .then((data) => {
        if (cancelled) return;
        if (data.confidence === "low") {
          setEnrichment(null);
        } else {
          setEnrichment(data);
        }
      })
      .catch(() => {
        if (!cancelled) setEnrichment(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  // Intentional: dep array uses primitive keys only — including the full `request` object
  // would cause infinite re-renders since it's a new object on every IrisPopup render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.zone_code, request?.intent, enabled]);

  if (!enabled) {
    return { enrichment: null, isLoading: false };
  }

  return { enrichment, isLoading };
}
