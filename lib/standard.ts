// lib/standard.ts

export type Severity = "critical" | "major" | "minor";
export type Category = "precision" | "consistency" | "fact" | "tone";

export type Issue = {
  code: string;
  severity: Severity;
  category: Category;
  message: string;
  evidence?: string;
};

export type StandardResponse = {
  pass: boolean;
  issues: Issue[];
  bullets: string[]; // UI-kompat
};

export type StepKey =
  | "presisjonskontroll"
  | "konsistenskontroll"
  | "faktagrunnlag"
  | "publiseringsklar"
  | "tekniskkontroll";

export type StepResult = {
  step: StepKey;
  pass: boolean;
  issues: Issue[];
  bullets?: string[];
};

function normalizeWhitespace(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function splitCode(line: string): { code: string; message: string } | null {
  const m = line.match(/^([A-ZÆØÅ0-9_]{3,60}):\s*(.+)$/);
  if (!m) return null;
  return { code: m[1].trim(), message: m[2].trim() };
}

function isSeverity(value: unknown): value is Severity {
  return value === "critical" || value === "major" || value === "minor";
}

function isCategory(value: unknown): value is Category {
  return (
    value === "precision" ||
    value === "consistency" ||
    value === "fact" ||
    value === "tone"
  );
}

function sanitizeIssue(i: Issue | null): Issue | null {
  if (!i) return null;

  const code = normalizeWhitespace(i.code || "");
  const message = normalizeWhitespace(i.message || "");
  if (!code || !message) return null;

  if (!isSeverity(i.severity)) return null;
  if (!isCategory(i.category)) return null;

  const evidence =
    typeof i.evidence === "string" && i.evidence.trim()
      ? i.evidence.trim()
      : undefined;

  return {
    code,
    severity: i.severity,
    category: i.category,
    message,
    evidence,
  };
}

function severityRank(s: Severity) {
  return s === "critical" ? 0 : s === "major" ? 1 : 2;
}

function dedupeIssues(issues: Issue[]) {
  const map = new Map<string, Issue>();

  for (const i of issues) {
    const key = `${i.code}::${i.message.toLowerCase()}::${(i.evidence ?? "").toLowerCase()}`;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, i);
      continue;
    }

    if (severityRank(i.severity) < severityRank(existing.severity)) {
      map.set(key, i);
    }
  }

  return Array.from(map.values());
}

function toBullets(issues: Issue[], max = 5) {
  return issues.slice(0, max).map((i) => `${i.code}: ${i.message}`);
}

function toolCategoryFor(tool: string): Category {
  if (tool === "presisjonskontroll") return "precision";
  if (tool === "konsistenskontroll") return "consistency";
  if (tool === "faktagrunnlag") return "fact";
  // publiseringsklar + tekniskkontroll bruker "tone" i felles schema
  return "tone";
}

function capForTool(tool: string) {
  if (tool === "presisjonskontroll") return 3;
  if (tool === "konsistenskontroll") return 5;
  if (tool === "faktagrunnlag") return 5;
  if (tool === "tekniskkontroll") return 5;
  return 3; // publiseringsklar
}

/**
 * Stegnivå:
 * Ett eller flere issues => step pass = false
 */
function inferPassFromIssues(issues: Issue[]) {
  return issues.length === 0;
}

export function normalizeToStandard(tool: string, parsed: unknown): StandardResponse {
  const toolCategory = toolCategoryFor(tool);
  const cap = capForTool(tool);

  const normalized: Issue[] = [];

  const obj = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  const rawIssues = Array.isArray(obj?.issues) ? obj.issues : null;

  // Ny standard: { pass, issues: Issue[] }
  if (rawIssues) {
    for (const it of rawIssues) {
      if (!it || typeof it !== "object") continue;

      const entry = it as Record<string, unknown>;

      const code = normalizeWhitespace(String(entry.code ?? ""));
      const message = normalizeWhitespace(String(entry.message ?? ""));
      if (!code || !message) continue;

      const sevRaw = String(entry.severity ?? "").toLowerCase();
      const severity: Severity = isSeverity(sevRaw) ? sevRaw : "major";

      const catRaw = String(entry.category ?? "").toLowerCase();
      const category: Category = isCategory(catRaw) ? catRaw : toolCategory;

      const evidence =
        typeof entry.evidence === "string" && entry.evidence.trim()
          ? entry.evidence.trim()
          : undefined;

      normalized.push({
        code,
        severity,
        category,
        message,
        evidence,
      });
    }
  } else {
    // Backup for gammel modell: begrunnelse: ["CODE: message", ...]
    const rawLegacy = Array.isArray(obj?.begrunnelse) ? obj.begrunnelse : [];

    const lines = rawLegacy
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 24);

    for (const line of lines) {
      const split = splitCode(line);

      if (split) {
        normalized.push({
          code: split.code,
          severity: tool === "publiseringsklar" ? "critical" : "major",
          category: toolCategory,
          message: split.message,
        });
      } else {
        normalized.push({
          code:
            tool === "presisjonskontroll"
              ? "PRES_UKJENT"
              : tool === "konsistenskontroll"
              ? "KONS_UKJENT"
              : tool === "faktagrunnlag"
              ? "FAKT_UKJENT"
              : tool === "tekniskkontroll"
              ? "TEKN_UKJENT"
              : "PUB_UKJENT",
          severity: tool === "publiseringsklar" ? "critical" : "major",
          category: toolCategory,
          message: line,
        });
      }
    }
  }

  const cleaned = dedupeIssues(
    normalized.map((i) => sanitizeIssue(i)).filter(Boolean) as Issue[]
  );

  cleaned.sort((a, b) => {
    const d = severityRank(a.severity) - severityRank(b.severity);
    if (d !== 0) return d;

    const c = a.code.localeCompare(b.code);
    if (c !== 0) return c;

    return a.message.localeCompare(b.message);
  });

  const capped = cleaned.slice(0, cap);
  const pass = inferPassFromIssues(capped);

  return {
    pass,
    issues: pass ? [] : capped,
    bullets: pass ? [] : toBullets(capped, cap),
  };
}