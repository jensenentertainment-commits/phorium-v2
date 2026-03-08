"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AccountChip } from "./AccountChip";

type StepKey =
  | "phorium:presisjon"
  | "phorium:konsistens"
  | "phorium:faktagrunnlag"
  | "phorium:publiseringsklar";

type StepState = Record<StepKey, boolean>;

const EMPTY_STEPS: StepState = {
  "phorium:presisjon": false,
  "phorium:konsistens": false,
  "phorium:faktagrunnlag": false,
  "phorium:publiseringsklar": false,
};

function isAppRoute(pathname: string) {
  return pathname.startsWith("/kontroll") || pathname.startsWith("/rapport");
}

function readStoredJson(key: StepKey) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function hasRun(key: StepKey) {
  return !!readStoredJson(key);
}

function readPass(key: StepKey): boolean | null {
  const parsed = readStoredJson(key);
  return typeof parsed?.pass === "boolean" ? parsed.pass : null;
}

function readAllSteps(): StepState {
  return {
    "phorium:presisjon": hasRun("phorium:presisjon"),
    "phorium:konsistens": hasRun("phorium:konsistens"),
    "phorium:faktagrunnlag": hasRun("phorium:faktagrunnlag"),
    "phorium:publiseringsklar": hasRun("phorium:publiseringsklar"),
  };
}

function getStatusLabel(
  pathname: string,
  doneCount: number,
  pubPass: boolean | null,
  running: boolean
) {
  if (pathname.startsWith("/rapport")) {
    if (pubPass === true) return "Rapport klar";
    if (pubPass === false) return "Rapport klar";
    return "Kontrollrapport";
  }

  if (running) return "Kontroll pågår";
  if (doneCount === 0) return "Klar for kontroll";
  if (doneCount < 4) return "Kontroll delvis fullført";
  return "Kontroll fullført";
}

function getStatusTone(
  pathname: string,
  doneCount: number,
  pubPass: boolean | null,
  running: boolean
): "neutral" | "active" | "ok" | "bad" {
  if (pathname.startsWith("/rapport")) {
    if (pubPass === true) return "ok";
    if (pubPass === false) return "bad";
    return "neutral";
  }

  if (running) return "active";
  if (doneCount === 4 && pubPass === true) return "ok";
  if (doneCount === 4 && pubPass === false) return "bad";
  return "neutral";
}

function statusToneClasses(tone: "neutral" | "active" | "ok" | "bad") {
  if (tone === "active") {
    return {
      wrap: "border-[color:var(--phorium-accent)]/25 bg-[var(--phorium-accent)]/10 text-[var(--phorium-text)]",
      dot: "bg-[var(--phorium-accent)]",
    };
  }

  if (tone === "ok") {
    return {
      wrap: "border-[color:var(--phorium-ok)]/25 bg-[var(--phorium-ok-bg)] text-[color:var(--phorium-ok)]",
      dot: "bg-[color:var(--phorium-ok)]",
    };
  }

  if (tone === "bad") {
    return {
      wrap: "border-[color:var(--phorium-bad)]/25 bg-[var(--phorium-bad-bg)] text-[color:var(--phorium-bad)]",
      dot: "bg-[color:var(--phorium-bad)]",
    };
  }

  return {
    wrap: "border-white/10 bg-white/[0.04] text-[var(--phorium-muted)]",
    dot: "bg-white/25",
  };
}

export function Navbar({
  isRunning = false,
  trialsLeft = null,
  showUpgrade = false,
}: {
  isRunning?: boolean;
  trialsLeft?: number | null;
  showUpgrade?: boolean;
}) {
  const pathname = usePathname();

  const appMode = useMemo(() => isAppRoute(pathname), [pathname]);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ran, setRan] = useState<StepState>(EMPTY_STEPS);
  const [pubPass, setPubPass] = useState<boolean | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updateFromStorage = () => {
      setRan(readAllSteps());
      setPubPass(readPass("phorium:publiseringsklar"));
    };

    updateFromStorage();

    const onFocus = () => updateFromStorage();
    const onStorage = () => updateFromStorage();
    const onStepsUpdated = () => updateFromStorage();

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    window.addEventListener("phorium:steps-updated", onStepsUpdated);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("phorium:steps-updated", onStepsUpdated);
    };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const doneCount = useMemo(() => {
    return Object.values(ran).filter(Boolean).length;
  }, [ran]);

  const allDone = doneCount === 4;

  const statusLabel = useMemo(() => {
    return getStatusLabel(pathname, doneCount, pubPass, isRunning);
  }, [pathname, doneCount, pubPass, isRunning]);

  const statusTone = useMemo(() => {
    return getStatusTone(pathname, doneCount, pubPass, isRunning);
  }, [pathname, doneCount, pubPass, isRunning]);

  const statusToneClass = statusToneClasses(statusTone);

  const primaryHref = useMemo(() => {
    if (pathname.startsWith("/rapport")) return "/kontroll";
    if (allDone) return "/rapport";
    return "/kontroll";
  }, [pathname, allDone]);

  const primaryLabel = useMemo(() => {
    if (pathname.startsWith("/rapport")) return "Ny kontroll";
    if (isRunning) return "Kontrollerer...";
    if (allDone) return "Se rapport";
    if (doneCount === 0) return "Start kontroll";
    return "Fortsett";
  }, [pathname, isRunning, allDone, doneCount]);

  const primaryDisabled = isRunning;

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto w-full max-w-6xl px-4 pt-4">
        <div
          className={[
            "overflow-visible rounded-[1.6rem] border border-white/10",
            "backdrop-blur-xl transition-all duration-300",
            "shadow-[0_12px_40px_rgba(0,0,0,0.26)]",
            scrolled ? "bg-[rgba(10,18,16,0.72)]" : "bg-[rgba(10,18,16,0.54)]",
          ].join(" ")}
        >
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 md:px-5">
            <Link href="/" className="group inline-flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] transition group-hover:bg-white/[0.08]">
                <span className="text-sm font-semibold text-[var(--phorium-text)]">P</span>
                <div className="absolute inset-[1px] rounded-[15px] ring-1 ring-white/5" />
              </div>

              <div className="min-w-0 leading-tight">
                <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--phorium-muted)]">
                  Phorium
                </div>
                <div className="truncate text-sm text-[var(--phorium-text)]">
                  {appMode ? "Kontrollsystem" : "Siste kontroll før publisering"}
                </div>
              </div>
            </Link>

            <div className="hidden flex-1 items-center justify-center lg:flex">
              {appMode ? (
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                      statusToneClass.wrap,
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-1.5 w-1.5 rounded-full",
                        statusToneClass.dot,
                        statusTone === "active" ? "animate-pulse" : "",
                      ].join(" ")}
                    />
                    <span className="font-semibold">{statusLabel}</span>
                  </span>

                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[var(--phorium-muted)]">
                    Standard v1.0
                  </span>

                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs tabular-nums text-[var(--phorium-muted)]">
                    <span className="font-semibold text-[var(--phorium-text)]">{doneCount}/4</span>
                    <span className="ml-1">fullført</span>
                  </span>
                </div>
              ) : (
                <nav className="flex items-center gap-5">
                  <Link
                    href="/standard"
                    className="text-sm text-[var(--phorium-muted)] transition hover:text-[var(--phorium-text)]"
                  >
                    Standard
                  </Link>
                  <Link
                    href="/personvern"
                    className="text-sm text-[var(--phorium-muted)] transition hover:text-[var(--phorium-text)]"
                  >
                    Personvern
                  </Link>
                  <Link
                    href="/vilkar"
                    className="text-sm text-[var(--phorium-muted)] transition hover:text-[var(--phorium-text)]"
                  >
                    Vilkår
                  </Link>
                  
                     <AccountChip />
                  
                </nav>
              )}
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              {appMode && typeof trialsLeft === "number" && !isRunning && (
                <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[var(--phorium-muted)] xl:inline-flex">
                  Prøve:
                  <span className="ml-1 font-semibold text-[var(--phorium-text)]">
                    {trialsLeft}
                  </span>
                </span>
              )}

              {appMode && showUpgrade && !isRunning && (
                <Link
                  href="/oppgrader"
                  className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[var(--phorium-text)] transition hover:bg-white/[0.08] xl:inline-flex"
                >
                  Oppgrader
                </Link>
              )}

              {appMode && (
  <div className="hidden xl:block">
    <AccountChip />
  </div>
)}

              {primaryDisabled ? (
                <span className="inline-flex min-w-[148px] items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[var(--phorium-muted)]">
                  {primaryLabel}
                </span>
              ) : (
                <Link
                  href={primaryHref}
                  className={[
                    "inline-flex min-w-[148px] items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold",
                    "transition shadow-[0_10px_28px_rgba(0,0,0,0.28)]",
                    pathname.startsWith("/rapport")
                      ? "border border-white/10 bg-white/[0.06] text-[var(--phorium-text)] hover:bg-white/[0.09]"
                      : "bg-[var(--phorium-accent)] text-[#11140f] hover:brightness-105 active:brightness-95",
                  ].join(" ")}
                >
                  {primaryLabel}
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-[var(--phorium-text)] transition hover:bg-white/[0.08] sm:hidden"
              aria-expanded={menuOpen}
              aria-label="Åpne meny"
            >
              {menuOpen ? "Lukk" : "Meny"}
            </button>
          </div>

          {appMode && (
            <div className="hidden border-t border-white/8 px-5 py-3 lg:block">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-[var(--phorium-muted)]">
                  {isRunning ? (
                    <>
                      Systemstatus:{" "}
                      <span className="font-semibold text-[var(--phorium-text)]">
                        Behandler innsending
                      </span>
                    </>
                  ) : pathname.startsWith("/rapport") ? (
                    <>
                      Resultat:{" "}
                      <span className="font-semibold text-[var(--phorium-text)]">
                        Kontrollrapport tilgjengelig
                      </span>
                    </>
                  ) : doneCount === 0 ? (
                    <>
                      Klar for ny kontroll under{" "}
                      <span className="font-semibold text-[var(--phorium-text)]">
                        Phorium Standard
                      </span>
                    </>
                  ) : allDone ? (
                    <>
                      Kontroll fullført.{" "}
                      <span className="font-semibold text-[var(--phorium-text)]">
                        Rapport kan åpnes
                      </span>
                    </>
                  ) : (
                    <>
                      Kontroll delvis fullført.{" "}
                      <span className="font-semibold text-[var(--phorium-text)]">
                        {doneCount} av 4 vurderinger lagret
                      </span>
                    </>
                  )}
                </div>

                <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/8">
                  <div
                    className={[
                      "h-full rounded-full transition-all duration-300",
                      statusTone === "bad"
                        ? "bg-[var(--phorium-bad)]"
                        : statusTone === "ok"
                        ? "bg-[var(--phorium-ok)]"
                        : "bg-[var(--phorium-accent)]",
                    ].join(" ")}
                    style={{ width: `${(doneCount / 4) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {menuOpen && (
            <div className="border-t border-white/10 bg-black/20 px-4 py-4 sm:hidden">
              <div className="flex flex-col gap-2">
                {appMode ? (
                  <>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={[
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                            statusToneClass.wrap,
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              statusToneClass.dot,
                              statusTone === "active" ? "animate-pulse" : "",
                            ].join(" ")}
                          />
                          <span className="font-semibold">{statusLabel}</span>
                        </span>

                        <span className="text-xs text-[var(--phorium-muted)]">
                          {doneCount}/4
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                        <div
                          className={[
                            "h-full rounded-full transition-all duration-300",
                            statusTone === "bad"
                              ? "bg-[var(--phorium-bad)]"
                              : statusTone === "ok"
                              ? "bg-[var(--phorium-ok)]"
                              : "bg-[var(--phorium-accent)]",
                          ].join(" ")}
                          style={{ width: `${(doneCount / 4) * 100}%` }}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[var(--phorium-muted)]">
                          Standard v1.0
                        </span>

                        {typeof trialsLeft === "number" && (
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[var(--phorium-muted)]">
                            Prøve:{" "}
                            <span className="font-semibold text-[var(--phorium-text)]">
                              {trialsLeft}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {!primaryDisabled ? (
                      <Link
                        href={primaryHref}
                        className={[
                          "mt-1 rounded-2xl px-4 py-3 text-center text-sm font-semibold",
                          pathname.startsWith("/rapport")
                            ? "border border-white/10 bg-white/[0.06] text-[var(--phorium-text)]"
                            : "bg-[var(--phorium-accent)] text-[#11140f]",
                        ].join(" ")}
                      >
                        {primaryLabel}
                      </Link>
                    ) : (
                      <div className="mt-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-center text-sm font-semibold text-[var(--phorium-muted)]">
                        {primaryLabel}
                      </div>
                    )}

                    <Link
                      href="/min-side"
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm text-[var(--phorium-text)]"
                    >
                      Min side
                    </Link>

                    {showUpgrade && !isRunning && (
                      <Link
                        href="/oppgrader"
                        className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm text-[var(--phorium-text)]"
                      >
                        Oppgrader
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/kontroll"
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[var(--phorium-text)] transition hover:bg-white/[0.07]"
                    >
                      Kontroll
                    </Link>
                    <Link
                      href="/standard"
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[var(--phorium-text)] transition hover:bg-white/[0.07]"
                    >
                      Standard
                    </Link>
                    <Link
                      href="/personvern"
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[var(--phorium-text)] transition hover:bg-white/[0.07]"
                    >
                      Personvern
                    </Link>
                    <Link
                      href="/vilkar"
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[var(--phorium-text)] transition hover:bg-white/[0.07]"
                    >
                      Vilkår
                    </Link>
                    <Link
                      href="/min-side"
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[var(--phorium-text)] transition hover:bg-white/[0.07]"
                    >
                      Min side
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="relative h-px">
            <div className="absolute inset-0 bg-white/8" />
            <div
              className={[
                "absolute inset-0 transition-opacity duration-500",
                scrolled ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--phorium-accent), transparent)",
                filter: "blur(8px)",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}