"use client";

import { useMemo, useState } from "react";
import { Editor } from "./Editor";
import { Result } from "./Result";
import { ToolStepper } from "./ToolStepper";
import { getDraft, setDraft, clearDraft } from "@/lib/drafts";
import type { Issue, StandardResponse } from "@/lib/standard";

type Verdict = "idle" | "loading" | "pass" | "fail" | "error";

const MIN_CHARS = 140;
const STORE_KEY = "phorium:konsistens";
const MAX_VIEW = 5;

function toBullets(issues: Issue[], max = MAX_VIEW) {
  return issues
    .slice(0, max)
    .map((i) => `${i.code}: ${i.message}`.trim());
}

function sanitizeIssues(raw: unknown): Issue[] {
  if (!Array.isArray(raw)) return [];

  const out: Issue[] = [];

  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const anyX = x as any;

    const code = typeof anyX.code === "string" ? anyX.code.trim() : "";
    const severity = typeof anyX.severity === "string" ? anyX.severity : "";
    const category = typeof anyX.category === "string" ? anyX.category : "";
    const message = typeof anyX.message === "string" ? anyX.message.trim() : "";
    const evidence = typeof anyX.evidence === "string" ? anyX.evidence.trim() : undefined;

    if (!code || !message) continue;
    if (!["critical", "major", "minor"].includes(severity)) continue;
    if (!["precision", "consistency", "fact", "tone"].includes(category)) continue;

    out.push({
      code,
      severity,
      category,
      message,
      evidence,
    });
  }

  return out;
}

export function ConsistencyCheck() {
  const [text, setText] = useState(() => getDraft());
  const [verdict, setVerdict] = useState<Verdict>("idle");
  const [bullets, setBullets] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const canSubmit = useMemo(() => text.trim().length >= MIN_CHARS, [text]);

  function onChange(next: string) {
    setText(next);
    setDraft(next);
  }

  async function onCheck() {
    if (verdict === "loading") return;

    setVerdict("loading");
    setBullets([]);
    setMessage("");

    try {
      const res = await fetch("/api/tools/konsistenskontroll", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setVerdict("error");
        setMessage(err?.error || "Uventet feil ved vurdering.");
        return;
      }

      const data = (await res.json()) as Partial<StandardResponse>;

      const issues = sanitizeIssues(data.issues);
      const pass =
        typeof data.pass === "boolean"
          ? data.pass
          : issues.length === 0; // fallback only if API is broken

      const list = toBullets(issues, MAX_VIEW);

      setBullets(list);
      setVerdict(pass ? "pass" : "fail");

     if (typeof window !== "undefined") {
  window.localStorage.setItem(
    STORE_KEY,
    JSON.stringify({
      pass,
      issues,
      bullets: list,
      submittedText: text,
      submittedAt: Date.now(),
    })
  );
}
    } catch {
      setVerdict("error");
      setMessage("Uventet feil. Prøv igjen om litt.");
    }
  }

  function onReset() {
    clearDraft();
    setText("");
    setVerdict("idle");
    setBullets([]);
    setMessage("");

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORE_KEY);
    }
  }

  const showStepper = verdict === "pass" || verdict === "fail";

  return (
    <section className="rounded-3xl border border-white/10 bg-black/25 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur">
      <div className="p-4 md:p-6">
        <Editor
          value={text}
          onChange={onChange}
          disabled={verdict === "loading"}
          hint={canSubmit ? "Klar til kontroll." : `For kort tekst. Minst ${MIN_CHARS} tegn.`}
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onCheck}
            disabled={!canSubmit || verdict === "loading"}
            className={[
              "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold",
              "bg-[var(--phorium-accent)] text-[#11140f]",
              "shadow-[0_16px_50px_rgba(0,0,0,0.5)]",
              "transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "hover:brightness-105 active:translate-y-0 active:brightness-95",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--phorium-accent)]",
              "ring-1 ring-black/10",
            ].join(" ")}
          >
            {verdict === "loading" ? "Kontrollerer…" : "Kontroller konsistens"}
          </button>

          <div className="text-xs text-[var(--phorium-muted)]">Én innsending. Én avgjørelse.</div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-white/0 p-4 md:p-6">
        <Result
          verdict={verdict}
          bullets={bullets}
          message={message}
          submittedText={text}
          onReset={onReset}
          labels={{
            title: "Resultat",
            passBadge: "OK",
            failBadge: "Ikke ok",
            failIntro: "Dette må forbedres:",
            copyBullets: "Kopier punkter",
            reset: "Nullstill",
            showSubmitted: "Vis innsendt tekst",
            hideSubmitted: "Skjul innsendt tekst",
          }}
        />

        {showStepper && (
  <ToolStepper
    prev={{ label: "Presisjonskontroll", href: "/presisjonskontroll" }}
    next={{ label: "Faktagrunnlag", href: "/faktagrunnlag" }}
  />
)}
      </div>
    </section>
  );
}