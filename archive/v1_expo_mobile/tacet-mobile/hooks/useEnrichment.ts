import { useEffect, useState } from "react";
import type { EnrichmentRequest, EnrichmentResult } from "@/types/enrichment";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://tacet.vercel.app";

interface UseEnrichmentResult {
  enrichment: EnrichmentResult | null;
  isLoading: boolean;
}

export function useEnrichment(request: EnrichmentRequest | null): UseEnrichmentResult {
  const [enrichment, setEnrichment] = useState<EnrichmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!request) {
      setEnrichment(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`${API_BASE}/api/enrich`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
      .then((res) => res.json() as Promise<EnrichmentResult>)
      .then((data) => {
        if (cancelled) return;
        // Discard low-confidence results — don't surface unhelpful summaries
        setEnrichment(data.confidence === "low" ? null : data);
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
  // Stable dep: zone_code + intent are the only values that should trigger a new call.
  // Passing full `request` object would re-fire on every render since it's a new reference.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.zone_code, request?.intent]);

  return { enrichment, isLoading };
}
