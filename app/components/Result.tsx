"use client";

import { useState } from "react";

export type Verdict = "idle" | "loading" | "pass" | "fail" | "error";

const DEFAULT_LABELS = {
  title: "Resultat",
  passBadge: "OK",
  failBadge: "Ikke ok",
  failIntro: "Dette må forbedres:",
  copyBullets: "Kopier punkter",
  reset: "Nullstill",
  showSubmitted: "Vis innsendt tekst",
  hideSubmitted: "Skjul innsendt tekst",
} as const;

export function Result({
  verdict,
  bullets,
  message,
  submittedText,
  errorMessage,
  onReset,
  labels,
}: {
  verdict: Verdict;
  bullets?: string[];
  message?: string;
  submittedText?: string;
  errorMessage?: string;
  onReset: () => void;
  labels?: Partial<typeof DEFAULT_LABELS>;
}) {
  const L = { ...DEFAULT_LABELS, ...(labels ?? {}) };

  const [showSubmitted, setShowSubmitted] = useState(false);

  const isIdle = verdict === "idle";
  const isLoading = verdict === "loading";
  const isPass = verdict === "pass";
  const isFail = verdict === "fail";
  const isError = verdict === "error";

  async function copy(text?: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      alert("Kunne ikke kopiere. Kopier manuelt.");
    }
  }

  const list = (bullets ?? []).filter(Boolean).slice(0, 3);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">{L.title}</h2>

        {!isIdle && !isLoading && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs rounded-full px-3 py-1 border border-white/10 text-[var(--phorium-muted)] hover:text-[var(--phorium-text)] hover:border-white/20"
          >
            {L.reset}
          </button>
        )}
      </div>

      {isIdle && (
        <p className="mt-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-[var(--phorium-muted)]">
          Ingen vurdering ennå.
        </p>
      )}

      {isLoading && (
        <p className="mt-3 text-sm text-[var(--phorium-muted)]">
          Vurderer teksten…
        </p>
      )}

      {isError && (
        <p className="mt-3 text-sm text-[var(--phorium-muted)]">
          {errorMessage || "Uventet feil. Prøv igjen om litt."}
        </p>
      )}

      {isPass && (
        <div className="mt-4">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[var(--phorium-accent)] text-[#11140f]">
            {L.passBadge}
          </div>
        </div>
      )}

      {isFail && (
        <div className="mt-4">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border border-white/10 bg-white/5">
            {L.failBadge}
          </div>

          {list.length > 0 ? (
            <>
              <p className="mt-3 text-sm text-[var(--phorium-muted)]">
                {L.failIntro}
              </p>

              <ul className="mt-2 space-y-2 text-sm text-[var(--phorium-muted)]">
                {list.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[var(--phorium-accent)]/70" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {L.copyBullets && (
                <button
                  type="button"
                  onClick={() => copy(list.join("\n"))}
                  className="mt-3 text-xs rounded-full px-3 py-1 border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                >
                  {L.copyBullets}
                </button>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-[var(--phorium-muted)]">
              {message || "Teksten mangler kravene."}
            </p>
          )}
        </div>
      )}

      {submittedText && L.showSubmitted && (
        <button
          type="button"
          onClick={() => setShowSubmitted((v) => !v)}
          className="mt-4 text-xs text-[var(--phorium-muted)] underline"
        >
          {showSubmitted ? L.hideSubmitted : L.showSubmitted}
        </button>
      )}

      {showSubmitted && submittedText && (
        <textarea
          readOnly
          value={submittedText}
          className="mt-2 w-full min-h-[140px] rounded-xl px-3 py-2 text-xs bg-white/5 border border-white/10"
        />
      )}
    </div>
  );
}
