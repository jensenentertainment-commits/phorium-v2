// lib/reportStore.ts
import type { Issue } from "@/lib/standard";

export type StoredStepPayload = {
  pass: boolean;
  issues: Issue[];
  bullets: string[];
  submittedText: string;
  submittedAt: number;
};

export function saveStepResult(key: string, payload: Omit<StoredStepPayload, "submittedAt"> & { submittedAt?: number }) {
  if (typeof window === "undefined") return;

  const safe = {
    pass: !!payload.pass,
    issues: Array.isArray(payload.issues) ? payload.issues : [],
    bullets: Array.isArray(payload.bullets) ? payload.bullets : [],
    submittedText: typeof payload.submittedText === "string" ? payload.submittedText : "",
    submittedAt: typeof payload.submittedAt === "number" ? payload.submittedAt : Date.now(),
  };

  window.localStorage.setItem(key, JSON.stringify(safe));
}

export function readStepResult<T = any>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}