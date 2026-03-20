import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { EnrichmentRequest, EnrichmentResult } from "@/types/enrichment";

const MODEL = "claude-haiku-4-5-20251001";
const TIMEOUT_MS = 1500;

const SYSTEM_PROMPT = `Tu es un assistant de Tacet, application de bruit urbain à Paris.
Tu résumes en 1-2 phrases le contexte sonore d'une zone pour un utilisateur mobile.
Ton ton est calme, factuel, utile. Tu ne répètes pas le score — tu l'enrichis.
Réponds uniquement en JSON valide:
{"summary":"...","primary_signal":"rumeur"|"chantier"|"reports"|"score"|"night","secondary_signal"?:"...","confidence":"high"|"low"}`;

const LOW_CONFIDENCE_RESULT: EnrichmentResult = {
  summary: "",
  primary_signal: "score",
  confidence: "low",
  cachedAt: null,
};

const NO_STORE = { "Cache-Control": "no-store" } as const;

interface CacheEntry {
  result: EnrichmentResult;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function getCacheKey(zone_code: string, intent: string | null | undefined): string {
  return `enrich-${zone_code}-${Math.floor(Date.now() / 900_000)}-${intent ?? "none"}`;
}

export async function POST(request: NextRequest) {
  let body: EnrichmentRequest;
  try {
    body = (await request.json()) as EnrichmentRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: NO_STORE });
  }

  if (!body.zone_code || typeof body.zone_code !== "string") {
    return NextResponse.json({ error: "zone_code required" }, { status: 400, headers: NO_STORE });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(LOW_CONFIDENCE_RESULT, { headers: NO_STORE });
  }

  const cacheKey = getCacheKey(body.zone_code, body.intent);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json(cached.result, { headers: NO_STORE });
  }

  try {
    const client = new Anthropic({ apiKey });

    const claudeCall = client.messages.create({
      model: MODEL,
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: JSON.stringify(body) }],
    });

    const timeoutReject = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS)
    );

    const message = await Promise.race([claudeCall, timeoutReject]);

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    const parsed = JSON.parse(textContent.text) as Partial<EnrichmentResult>;
    if (!parsed.summary || !parsed.primary_signal || !parsed.confidence) {
      throw new Error("Missing required fields in response");
    }

    const result: EnrichmentResult = {
      summary: parsed.summary,
      primary_signal: parsed.primary_signal,
      secondary_signal: parsed.secondary_signal,
      confidence: parsed.confidence,
      cachedAt: new Date().toISOString(),
    };

    cache.set(cacheKey, { result, expiresAt: Date.now() + 900_000 });
    return NextResponse.json(result, { headers: NO_STORE });
  } catch {
    return NextResponse.json(LOW_CONFIDENCE_RESULT, { headers: NO_STORE });
  }
}
