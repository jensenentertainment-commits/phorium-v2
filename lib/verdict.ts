// lib/verdict.ts

import type { Issue, StepResult, Severity } from "./standard";

export type Verdict = {
  pass: boolean;
  reason: string;
};

function normalizeKey(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[“”"']/g, "")
    .trim();
}

function severityRank(s: Severity) {
  return s === "critical" ? 3 : s === "major" ? 2 : 1;
}

function pickHigherSeverity(a: Severity, b: Severity) {
  return severityRank(a) >= severityRank(b) ? a : b;
}

function countBySeverity(issues: Issue[]) {
  const critical = issues.filter((i) => i.severity === "critical").length;
  const major = issues.filter((i) => i.severity === "major").length;
  const minor = issues.filter((i) => i.severity === "minor").length;

  return { critical, major, minor };
}

function defaultReason(pass: boolean, crit: number, major: number, minor: number) {
  if (pass) {
    if (crit + major + minor === 0) {
      return "Ingen avvik registrert.";
    }
    return "Teksten vurderes publiseringsklar etter gjeldende standard.";
  }

  if (crit > 0) {
    return "Publisering frarådes. Kritiske avvik er registrert.";
  }

  if (major >= 3) {
    return "Publisering frarådes. Minst tre alvorlige avvik er registrert.";
  }

  if (major > 0) {
    return "Publisering frarådes. Alvorlige avvik er registrert.";
  }

  return "Publisering frarådes. Avvik er registrert.";
}

/**
 * Brukes kun når publiseringsklar ikke er kjørt.
 * Hard rules:
 * - 1+ critical => fail
 * - 3+ major => fail
 * - ellers pass
 */
export function computePreVerdict(issues: Issue[]): Verdict {
  const { critical, major, minor } = countBySeverity(issues);

  if (critical >= 1) {
    return {
      pass: false,
      reason: defaultReason(false, critical, major, minor),
    };
  }

  if (major >= 3) {
    return {
      pass: false,
      reason: defaultReason(false, critical, major, minor),
    };
  }

  return {
    pass: true,
    reason: defaultReason(true, critical, major, minor),
  };
}

export function mergeStepResults(results: StepResult[]) {
  const byKey = new Map<string, Issue>();

  for (const r of results) {
    for (const iss of r.issues || []) {
      const code = (iss.code || "").trim();
      const msg = (iss.message || "").trim();
      if (!msg) continue;

      // Stabil dedupe:
      // - bruk code hvis den finnes
      // - ellers normalisert message
      const key = code ? `code::${code}` : `msg::${normalizeKey(msg)}`;

      const existing = byKey.get(key);

      if (!existing) {
        byKey.set(key, iss);
      } else {
        byKey.set(key, {
          ...existing,
          severity: pickHigherSeverity(existing.severity, iss.severity),
          category: existing.category || iss.category,
          message:
            existing.message.length >= iss.message.length
              ? existing.message
              : iss.message,
          evidence: existing.evidence || iss.evidence,
        });
      }
    }
  }

  const issues = Array.from(byKey.values()).sort((a, b) => {
    const d = severityRank(b.severity) - severityRank(a.severity);
    if (d !== 0) return d;

    const c = (a.code || "").localeCompare(b.code || "");
    if (c !== 0) return c;

    return (a.message || "").localeCompare(b.message || "");
  });

  const { critical, major, minor } = countBySeverity(issues);

  // Hard rules styrer alltid sluttvurderingen
  if (critical >= 1) {
    return {
      issues,
      verdict: {
        pass: false,
        reason: defaultReason(false, critical, major, minor),
      },
      source: "heuristic" as const,
    };
  }

  if (major >= 3) {
    return {
      issues,
      verdict: {
        pass: false,
        reason: defaultReason(false, critical, major, minor),
      },
      source: "heuristic" as const,
    };
  }

  // Publiseringsklar kan stoppe, men ikke tvinge gjennom pass
  const step4 = results.find((r) => r.step === "publiseringsklar");
  if (step4?.pass === false) {
    return {
      issues,
      verdict: {
        pass: false,
        reason: defaultReason(false, critical, major, minor),
      },
      source: "publiseringsklar" as const,
    };
  }

  return {
    issues,
    verdict: {
      pass: true,
      reason: defaultReason(true, critical, major, minor),
    },
    source: step4 ? ("publiseringsklar" as const) : ("heuristic" as const),
  };
}