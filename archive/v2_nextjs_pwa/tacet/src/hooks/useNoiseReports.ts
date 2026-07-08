"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tacet-noise-reports";
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const COOLDOWN_MS = 5 * 60 * 1000; // 5 min per zone per session

interface NoiseReport {
  zoneCode: string;
  timestamp: number;
}

function loadReports(): NoiseReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as NoiseReport[];
  } catch {
    return [];
  }
}

function saveReports(reports: NoiseReport[]) {
  if (typeof window === "undefined") return;
  try {
    // Only keep reports from the last hour to avoid unbounded growth
    const cutoff = Date.now() - WINDOW_MS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.filter((r) => r.timestamp > cutoff)));
  } catch {
    // ignore
  }
}

export function useNoiseReports(zoneCode: string) {
  const [reports, setReports] = useState<NoiseReport[]>([]);
  const [lastReportedAt, setLastReportedAt] = useState<number | null>(null);

  useEffect(() => {
    const all = loadReports();
    setReports(all);
    const zoneReports = all.filter((r) => r.zoneCode === zoneCode);
    const last = zoneReports.at(-1)?.timestamp ?? null;
    setLastReportedAt(last);
  }, [zoneCode]);

  const recentCount = reports.filter(
    (r) => r.zoneCode === zoneCode && r.timestamp > Date.now() - WINDOW_MS
  ).length;

  const canReport = lastReportedAt === null || Date.now() - lastReportedAt > COOLDOWN_MS;

  const addReport = useCallback(() => {
    if (!canReport) return;
    const now = Date.now();
    const report: NoiseReport = { zoneCode, timestamp: now };
    setReports((prev) => {
      const next = [...prev, report];
      saveReports(next);
      return next;
    });
    setLastReportedAt(now);
  }, [zoneCode, canReport]);

  return { recentCount, canReport, addReport };
}
