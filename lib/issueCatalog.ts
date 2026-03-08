import type { Category, Severity } from "./standard";

export type IssueDef = {
  code: string;
  severity: Severity;
  category: Category;
};

export const ISSUE_CATALOG: Record<string, IssueDef> = {
  // Logic / consistency
  DATE_INVALID: { code: "DATE_INVALID", severity: "critical", category: "consistency" },
  SELF_CONTRADICTION: { code: "SELF_CONTRADICTION", severity: "critical", category: "consistency" },
  TIMEFRAME_CONFLICT: { code: "TIMEFRAME_CONFLICT", severity: "major", category: "consistency" },
  ACTOR_CONFLICT: { code: "ACTOR_CONFLICT", severity: "major", category: "consistency" },
  TERM_INCONSISTENT: { code: "TERM_INCONSISTENT", severity: "major", category: "consistency" },

  // Fact / verifiability
  FACTUAL_ERROR: { code: "FACTUAL_ERROR", severity: "critical", category: "fact" },
  UNVERIFIABLE_SOURCE: { code: "UNVERIFIABLE_SOURCE", severity: "major", category: "fact" },
  AUTHORITY_NO_SOURCE: { code: "AUTHORITY_NO_SOURCE", severity: "major", category: "fact" },
  STAT_NO_SOURCE: { code: "STAT_NO_SOURCE", severity: "major", category: "fact" },
  CLAIM_NO_EVIDENCE: { code: "CLAIM_NO_EVIDENCE", severity: "major", category: "fact" },

  // Precision
  VAGUE_QUALITY: { code: "VAGUE_QUALITY", severity: "minor", category: "precision" },
  SUPERLATIVE_NO_REF: { code: "SUPERLATIVE_NO_REF", severity: "major", category: "precision" },
  TOTALIZING_CLAIM: { code: "TOTALIZING_CLAIM", severity: "major", category: "precision" },
  ABSOLUTE_TERM: { code: "ABSOLUTE_TERM", severity: "minor", category: "precision" },
  MISSING_SCOPE: { code: "MISSING_SCOPE", severity: "major", category: "precision" },

  // Tone / form
  TONE_MISMATCH: { code: "TONE_MISMATCH", severity: "major", category: "tone" },
  INFORMAL_LANGUAGE: { code: "INFORMAL_LANGUAGE", severity: "minor", category: "tone" },
  HASHTAGS_IN_FORMAL: { code: "HASHTAGS_IN_FORMAL", severity: "minor", category: "tone" },
};