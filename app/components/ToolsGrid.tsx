"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TOOL_ORDER, TOOLS, type StandardToolKey } from "@/lib/tools";

const STORE_KEY: Record<StandardToolKey, string> = {
  presisjonskontroll: "phorium:presisjon",
  konsistenskontroll: "phorium:konsistens",
  faktagrunnlag: "phorium:faktagrunnlag",
  publiseringsklar: "phorium:publiseringsklar",
};

function hasRun(key: string) {
  if (typeof window === "undefined") return false;
  return !!window.localStorage.getItem(key);
}

export function ToolsGrid() {
  const [ran, setRan] = useState<Record<StandardToolKey, boolean>>({
    presisjonskontroll: false,
    konsistenskontroll: false,
    faktagrunnlag: false,
    publiseringsklar: false,
  });

  useEffect(() => {
    const update = () => {
      setRan({
        presisjonskontroll: hasRun(STORE_KEY.presisjonskontroll),
        konsistenskontroll: hasRun(STORE_KEY.konsistenskontroll),
        faktagrunnlag: hasRun(STORE_KEY.faktagrunnlag),
        publiseringsklar: hasRun(STORE_KEY.publiseringsklar),
      });
    };

    update();
    window.addEventListener("focus", update);
    return () => window.removeEventListener("focus", update);
  }, []);

  const doneCount =
    (ran.presisjonskontroll ? 1 : 0) +
    (ran.konsistenskontroll ? 1 : 0) +
    (ran.faktagrunnlag ? 1 : 0) +
    (ran.publiseringsklar ? 1 : 0);

  const progressPct = Math.round((doneCount / 4) * 100);

  const allDone =
    ran.presisjonskontroll &&
    ran.konsistenskontroll &&
    ran.faktagrunnlag &&
    ran.publiseringsklar;

  const statusLine = useMemo(() => {
    if (doneCount === 0) return "Ingen kontroller er kjørt i denne nettleseren.";
    if (allDone) return "Alle steg er kjørt. Rapport er tilgjengelig.";
    return `${doneCount}/4 steg er kjørt. Rapporten blir komplett når alle fire er kjørt.`;
  }, [doneCount, allDone]);

  return (
    <div className="space-y-4">
      {/* Top CTA: Full kontroll er hovedløypa */}
      <div className="rounded-3xl border border-white/10 bg-black/20 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs tracking-[0.22em] uppercase text-[var(--phorium-muted)]">
              {allDone ? "Kontroll gjennomført" : "Kjør kontroll"}
            </div>

            <div className="mt-2 text-sm text-[var(--phorium-muted)]">
              Lim inn tekst én gang. Systemet kjører alle kontroller og genererer rapport.
            </div>

            <div className="mt-3 text-[11px] text-[var(--phorium-muted)]">{statusLine}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/kontroll"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-[var(--phorium-accent)] text-[#11140f] hover:brightness-105 active:brightness-95 transition shadow-[0_16px_50px_rgba(0,0,0,0.45)]"
            >
              Kjør full kontroll →
            </Link>

            <Link
              href="/rapport"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold border border-white/10 bg-white/5 text-[var(--phorium-text)] hover:bg-white/10 transition"
            >
              Se rapport
            </Link>
          </div>
        </div>
      </div>

      {/* Step cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {TOOL_ORDER.map((key, idx) => {
          const t = TOOLS[key];
          const step = String(idx + 1).padStart(2, "0");
          const done = ran[key];

          const pill = done ? "Kjørt" : "Ikke kjørt";
          const footerText = done ? "Se sist resultat →" : "Kjør enkeltkontroll →";
          
          if (!t) return null;

          return (
            <Link key={key} href={t.href} className="block">
              <div
                className={[
                  "group relative rounded-3xl border backdrop-blur",
                  "p-5 shadow-[0_20px_70px_rgba(0,0,0,0.45)] transition",
                  "border-white/10 bg-black/25 hover:border-white/20 hover:bg-black/30",
                  done ? "ring-1 ring-white/10" : "",
                ].join(" ")}
              >
                <div className="relative flex items-start justify-between gap-3">
                  <div className="text-xs tracking-[0.22em] uppercase text-[var(--phorium-muted)]">
                    {step} / 04
                  </div>

                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-[var(--phorium-muted)]">
                    {pill}
                  </span>
                </div>

                <h3 className="relative mt-2 text-base font-semibold tracking-tight">{t.title}</h3>

                <p className="relative mt-2 text-sm text-[var(--phorium-muted)] leading-relaxed">
                  {t.blurb}
                </p>

                <div className="relative mt-4 text-xs text-[var(--phorium-muted)] group-hover:text-[var(--phorium-text)] transition">
                  {footerText}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Progress */}
      <div className="rounded-3xl border border-white/10 bg-black/15 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs tracking-[0.22em] uppercase text-[var(--phorium-muted)]">Status</div>
          <div className="text-[11px] text-[var(--phorium-muted)]">{doneCount}/4</div>
        </div>

        <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/10">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressPct}%`,
              background:
                "linear-gradient(90deg, rgba(200,183,122,0.95) 0%, rgba(200,183,122,0.55) 100%)",
            }}
          />
        </div>

        <div className="mt-2 text-[11px] text-[var(--phorium-muted)]">
          {allDone ? "Fullført. Rapporten er klar." : "Kjør full kontroll for å generere komplett rapport."}
        </div>
      </div>
    </div>
  );
}