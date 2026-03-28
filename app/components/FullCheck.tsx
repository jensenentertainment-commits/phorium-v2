"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Editor } from "./Editor";
import { getDraft, setDraft, clearDraft } from "@/lib/drafts";
import { saveStepResult } from "@/lib/reportStore";
import type { StandardResponse } from "@/lib/standard";

type Status = "none" | "running" | "ok" | "bad";

type AccessState = {
  email: string;
  displayName: string | null;
  freeRunsUsed: number;
  subscriptionStatus: "inactive" | "active" | "past_due" | "canceled";
  accessTier: "default" | "vip";
  canRun: boolean;
  canUseTechnical: boolean;
};

type StartRunAccess = AccessState & {
  runAllowed: boolean;
  runReason: "OK" | "FREE_LIMIT_REACHED" | "TECHNICAL_REQUIRES_SUBSCRIPTION";
  technicalEnabled: boolean;
};

type StartRunResponse = {
  ok: true;
  access: StartRunAccess;
};

type ApiError = Error & {
  code?: string;
  access?: AccessState | StartRunAccess | null;
};

const MIN_CHARS = 140;
const EMAIL_STORAGE_KEY = "phorium:email";
const RUNSTATE_STORAGE_KEY = "phorium:runstate";
const TECHNICAL_STORE_KEY = "phorium:tekniskkontroll";

const FLOW = [
  { label: "Presisjon", tool: "presisjonskontroll", storeKey: "phorium:presisjon" },
  { label: "Konsistens", tool: "konsistenskontroll", storeKey: "phorium:konsistens" },
  { label: "Faktagrunnlag", tool: "faktagrunnlag", storeKey: "phorium:faktagrunnlag" },
  { label: "Formell egnethet", tool: "publiseringsklar", storeKey: "phorium:publiseringsklar" },
] as const;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

function isValidEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

function chipClass(s: Status, isActive: boolean) {
  if (s === "ok") {
    return "border-[color:var(--phorium-ok)] bg-[var(--phorium-ok-bg)] text-[color:var(--phorium-ok)]";
  }
  if (s === "bad") {
    return "border-[color:var(--phorium-bad)] bg-[var(--phorium-bad-bg)] text-[color:var(--phorium-bad)]";
  }
  if (isActive) {
    return "border-white/20 bg-white/10 text-[var(--phorium-text)]";
  }
  return "border-white/10 bg-white/[0.04] text-[var(--phorium-muted)]";
}

function dotClass(s: Status, isActive: boolean) {
  if (s === "ok") return "bg-[color:var(--phorium-ok)]";
  if (s === "bad") return "bg-[color:var(--phorium-bad)]";
  if (isActive) return "bg-[var(--phorium-accent)]";
  return "bg-white/20";
}

function labelFor(s: Status, isActive: boolean) {
  if (isActive && s === "running") return "Kjører";
  if (s === "ok") return "OK";
  if (s === "bad") return "Avvik";
  return "—";
}

function Panel({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(10,18,16,0.34)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-6">
      {(eyebrow || title || subtitle) && (
        <div>
          {eyebrow ? (
            <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--phorium-muted)]">
              {eyebrow}
            </div>
          ) : null}

          {title ? (
            <div className="mt-2 text-lg font-semibold text-[var(--phorium-text)]">
              {title}
            </div>
          ) : null}

          {subtitle ? (
            <div className="mt-2 text-sm leading-relaxed text-[var(--phorium-muted)]">
              {subtitle}
            </div>
          ) : null}
        </div>
      )}

      <div className={eyebrow || title || subtitle ? "mt-5" : ""}>{children}</div>
    </div>
  );
}

function ScanIndicator({
  activeIndex,
  statuses,
}: {
  activeIndex: number;
  statuses: Status[];
}) {
  const stepPct = 100 / FLOW.length;
  const rowHeight = 74;

  function rowClass(st: Status, isActive: boolean) {
    return [
      "relative flex items-center justify-between gap-3 rounded-2xl border px-4 py-3",
      "transition-all duration-300 ease-out",
      isActive
        ? "translate-x-[2px] border-white/15 bg-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
        : "border-white/10 bg-white/[0.03]",
      st === "ok" ? "border-[color:var(--phorium-ok)]/20" : "",
      st === "bad" ? "border-[color:var(--phorium-bad)]/20" : "",
    ].join(" ");
  }

  function numberClass(st: Status, isActive: boolean) {
    return [
      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold tabular-nums",
      "transition-all duration-300 ease-out",
      isActive
        ? "border-white/15 bg-white/[0.09] text-[var(--phorium-text)] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
        : "border-white/10 bg-white/[0.04] text-[var(--phorium-text)]",
      st === "ok" ? "border-[color:var(--phorium-ok)]/25" : "",
      st === "bad" ? "border-[color:var(--phorium-bad)]/25" : "",
    ].join(" ");
  }

  function statusChipClass(st: Status, isActive: boolean) {
    if (isActive && st === "running") {
      return "border-[color:var(--phorium-accent)]/30 bg-[var(--phorium-accent)]/10 text-[var(--phorium-text)]";
    }
    return chipClass(st, isActive);
  }

  return (
    <Panel
      eyebrow="Kontrollstatus"
      title="Vurderingen pågår"
      subtitle="Phorium går gjennom hvert kontrollledd i fast rekkefølge før endelig vurdering."
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-[var(--phorium-muted)]">
          {activeIndex >= 0 ? `Steg ${activeIndex + 1}/${FLOW.length}` : "Klar til start"}
        </div>
        <div className="text-xs text-[var(--phorium-muted)]">Phorium Standard</div>
      </div>

      <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
        {activeIndex >= 0 && activeIndex < FLOW.length && (
          <div
            className="absolute inset-y-0 rounded-full bg-[var(--phorium-accent)]/30 transition-all duration-300 ease-out"
            style={{
              left: `${activeIndex * stepPct}%`,
              width: `${stepPct}%`,
              boxShadow: "0 0 24px color-mix(in srgb, var(--phorium-accent) 35%, transparent)",
            }}
          />
        )}

        <div
          aria-hidden
          className="absolute inset-y-0 w-16 rounded-full bg-white/10 blur-md"
          style={{
            left:
              activeIndex >= 0 && activeIndex < FLOW.length
                ? `calc(${activeIndex * stepPct}% + ${stepPct / 2}% - 2rem)`
                : "-9999px",
            transition: "left 300ms ease-out",
          }}
        />

        <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />
      </div>

      <div className="relative mt-4 overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-2">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 h-[82px] rounded-[1.25rem] opacity-70 blur-2xl transition-all duration-300 ease-out"
          style={{
            top: activeIndex >= 0 ? `${activeIndex * rowHeight + 4}px` : "4px",
            background:
              activeIndex >= 0
                ? "radial-gradient(80% 100% at 18% 50%, color-mix(in srgb, var(--phorium-accent) 18%, transparent) 0%, transparent 72%)"
                : "radial-gradient(80% 100% at 18% 50%, rgba(255,255,255,0.05) 0%, transparent 72%)",
            opacity: activeIndex >= 0 ? 0.8 : 0.25,
          }}
        />

        <div className="relative space-y-2">
          {FLOW.map((step, idx) => {
            const st = statuses[idx] ?? "none";
            const isActive = idx === activeIndex;

            return (
              <div key={step.tool} className={rowClass(st, isActive)}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className={numberClass(st, isActive)}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--phorium-text)]">
                      {step.label}
                    </div>
                  </div>
                </div>

                <span
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
                    "transition-all duration-300 ease-out",
                    statusChipClass(st, isActive),
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-1.5 w-1.5 rounded-full transition-all duration-300 ease-out",
                      dotClass(st, isActive),
                      isActive && st === "running"
                        ? "animate-pulse shadow-[0_0_12px_color-mix(in_srgb,var(--phorium-accent)_40%,transparent)]"
                        : "",
                    ].join(" ")}
                  />
                  <span className="font-semibold">{labelFor(st, isActive)}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

function SystemLog({
  lines,
  running,
}: {
  lines: Array<{ t: number; text: string }>;
  running: boolean;
}) {
  return (
    <Panel eyebrow="Prosesslogg" title="Hendelser under kontrollen">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-[var(--phorium-muted)]">
          {running ? "Pågår" : "Ingen aktiv kontroll"}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        {lines.length === 0 ? (
          <div className="text-[var(--phorium-muted)]">Ingen aktivitet ennå.</div>
        ) : (
          lines.slice(-10).map((l) => (
            <div key={l.t} className="flex gap-3">
              <span className="tabular-nums text-[var(--phorium-muted)]">
                {new Date(l.t).toLocaleTimeString("no-NO", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span className="text-[var(--phorium-text)]">{l.text}</span>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

function EmailGate({
  open,
  email,
  setEmail,
  onClose,
  onContinue,
  busy,
  error,
}: {
  open: boolean;
  email: string;
  setEmail: (value: string) => void;
  onClose: () => void;
  onContinue: () => void;
  busy: boolean;
  error: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[rgba(10,18,16,0.94)] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--phorium-muted)]">
          Første steg
        </div>

        <h3 className="mt-2 text-xl font-semibold text-[var(--phorium-text)]">
          Oppgi e-post for å starte kontrollen
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-[var(--phorium-muted)]">
          Phorium bruker e-post for å holde styr på gratis analyser og abonnement.
        </p>

        <div className="mt-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="navn@firma.no"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-[var(--phorium-text)] outline-none placeholder:text-[var(--phorium-muted)] focus:border-white/20 focus:ring-2 focus:ring-[var(--phorium-accent)]/20"
          />
        </div>

        {error ? (
          <div className="mt-3 text-sm text-[color:var(--phorium-bad)]">{error}</div>
        ) : null}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-[var(--phorium-muted)] transition hover:bg-white/[0.09] hover:text-[var(--phorium-text)] disabled:opacity-50"
          >
            Avbryt
          </button>

          <button
            type="button"
            onClick={onContinue}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-full bg-[var(--phorium-accent)] px-5 py-2 text-sm font-semibold text-[#11140f] transition hover:brightness-105 disabled:opacity-50"
          >
            {busy ? "Sjekker…" : "Fortsett"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Paywall({
  open,
  email,
  access,
  onClose,
}: {
  open: boolean;
  email: string;
  access: AccessState | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setLoading(false);
      setError("");
    }
  }, [open]);

  if (!open) return null;

  async function startCheckout() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Kunne ikke starte betaling.");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Kunne ikke starte betaling.");
      setLoading(false);
    }
  }

  const used = access?.freeRunsUsed ?? 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[1.75rem] border border-white/10 bg-[rgba(10,18,16,0.94)] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--phorium-muted)]">
          Abonnement
        </div>

        <h3 className="mt-2 text-2xl font-semibold text-[var(--phorium-text)]">
          Du har brukt opp dine gratis analyser
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-[var(--phorium-muted)]">
          Phorium gir 3 komplette analyser uten kostnad. Videre bruk krever abonnement.
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm text-[var(--phorium-text)]">
            Gratis analyser brukt: <span className="font-semibold">{used} av 3</span>
          </div>

          <div className="mt-3 space-y-2 text-sm text-[var(--phorium-muted)]">
            <div>249 kr / måned</div>
            <div>Ubegrensede analyser</div>
            <div>Teknisk kontroll inkludert</div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 text-sm text-[color:var(--phorium-bad)]">{error}</div>
        ) : null}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-[var(--phorium-muted)] transition hover:bg-white/[0.09] hover:text-[var(--phorium-text)] disabled:opacity-50"
          >
            Lukk
          </button>

          <button
            type="button"
            onClick={startCheckout}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-[var(--phorium-accent)] px-5 py-2 text-sm font-semibold text-[#11140f] transition hover:brightness-105 disabled:opacity-50"
          >
            {loading ? "Sender til betaling…" : "Start abonnement"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FullCheck() {
  const router = useRouter();

  const [text, setTextState] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const [statuses, setStatuses] = React.useState<Status[]>(["none", "none", "none", "none"]);
  const [message, setMessage] = React.useState("");
  const [log, setLog] = React.useState<Array<{ t: number; text: string }>>([]);
  const [includeTechnical, setIncludeTechnical] = React.useState(false);
  const [isRunning, setIsRunning] = React.useState(false);

  const [email, setEmail] = React.useState("");
  const [emailInput, setEmailInput] = React.useState("");
  const [showEmailGate, setShowEmailGate] = React.useState(false);
  const [showPaywall, setShowPaywall] = React.useState(false);
  const [gateError, setGateError] = React.useState("");
  const [gateBusy, setGateBusy] = React.useState(false);
  const [access, setAccess] = React.useState<AccessState | null>(null);

  const runningRef = React.useRef(false);

  const canSubmit = React.useMemo(() => text.trim().length >= MIN_CHARS, [text]);
  const effectiveCanUseTechnical = access?.canUseTechnical ?? false;

  const stepText = React.useMemo(() => {
    if (activeIndex < 0 || activeIndex >= FLOW.length) {
      return "Klar til å vurdere teksten før publisering.";
    }
    return `Vurderer teksten. Steg ${activeIndex + 1}/${FLOW.length}: ${FLOW[activeIndex].label}.`;
  }, [activeIndex]);

  React.useEffect(() => {
    setTextState(getDraft());

    if (typeof window === "undefined") return;

    const savedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY) ?? "";
    if (!savedEmail) return;

    const normalized = normalizeEmail(savedEmail);
    setEmail(normalized);
    setEmailInput(normalized);

    void refreshAccess(normalized);
  }, []);

  async function refreshAccess(targetEmail: string) {
    const res = await fetch("/api/phorium/access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Kunne ikke sjekke tilgang.");
    }

    const nextAccess = data.access as AccessState;
    setAccess(nextAccess);
    return nextAccess;
  }

  async function reserveRun(targetEmail: string) {
    const res = await fetch("/api/phorium/start-run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: targetEmail,
        includesTechnical: includeTechnical,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(
        data?.message || data?.error || "Kunne ikke starte analyse."
      ) as ApiError;
      err.code = data?.error;
      err.access = data?.access ?? null;
      throw err;
    }

    return data as StartRunResponse;
  }

  async function runTool(tool: string, submittedText: string) {
    const res = await fetch(`/api/tools/${tool}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: submittedText }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `Uventet feil i ${tool}.`);
    }

    return (await res.json()) as StandardResponse;
  }

  function setRunState(isActive: boolean) {
    runningRef.current = isActive;
    setIsRunning(isActive);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        RUNSTATE_STORAGE_KEY,
        JSON.stringify({ running: isActive, t: Date.now() })
      );
      window.dispatchEvent(new Event("phorium:runstate"));
    }
  }

  function dispatchStepsUpdated() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("phorium:steps-updated"));
    }
  }

  function clearStoredResults() {
    if (typeof window === "undefined") return;

    FLOW.forEach((step) => window.localStorage.removeItem(step.storeKey));
    window.localStorage.removeItem(TECHNICAL_STORE_KEY);
    dispatchStepsUpdated();
  }

  function pushLog(line: string) {
    const t = Date.now();
    setLog((prev) => [...prev, { t, text: line }]);
  }

  function onChange(next: string) {
    setTextState(next);
    setDraft(next);
  }

  async function beginRun(targetEmail: string) {
    if (!canSubmit || runningRef.current) return;

    setMessage("");
    setShowPaywall(false);

    const startData = await reserveRun(targetEmail);
    const reservedAccess = startData.access;
    setAccess(reservedAccess);

    setRunState(true);
    setLog([]);
    setActiveIndex(0);
    setStatuses(["running", "none", "none", "none"]);
    clearStoredResults();

    const submittedText = text;

    try {
      pushLog("Starter kontroll…");
      await sleep(150);

      pushLog("Validerer innsending…");
      await sleep(120);

      for (let idx = 0; idx < FLOW.length; idx++) {
        const step = FLOW[idx];

        setActiveIndex(idx);
        setStatuses((prev) => prev.map((status, i) => (i === idx ? "running" : status)));

        pushLog(`Vurderer ${step.label.toLowerCase()}…`);

        const data = await runTool(step.tool, submittedText);

        setStatuses((prev) =>
          prev.map((status, i) => (i === idx ? (data.pass ? "ok" : "bad") : status))
        );

        saveStepResult(step.storeKey, {
          pass: data.pass,
          issues: data.issues ?? [],
          bullets: data.bullets ?? [],
          submittedText,
        });

        dispatchStepsUpdated();

        pushLog(data.pass ? `${step.label}: godkjent.` : `${step.label}: avvik registrert.`);
        await sleep(160);
      }

      if (reservedAccess.technicalEnabled) {
        pushLog("Kjører teknisk kontroll…");
        await sleep(140);

        const tech = await runTool("tekniskkontroll", submittedText);

        saveStepResult(TECHNICAL_STORE_KEY, {
          pass: tech.pass,
          issues: tech.issues ?? [],
          bullets: tech.bullets ?? [],
          submittedText,
        });

        dispatchStepsUpdated();

        pushLog(tech.pass ? "Teknisk kontroll: godkjent." : "Teknisk kontroll: merknader registrert.");
        await sleep(140);
      }

      pushLog("Kompilerer rapport…");
      await sleep(200);

      pushLog("Fastsetter endelig vurdering…");
      await sleep(160);

      setDraft(submittedText);

      pushLog("Kontroll fullført. Åpner rapport.");
      await sleep(220);

      setActiveIndex(-1);
      setRunState(false);
      router.push("/rapport");
    } catch (e: any) {
      setActiveIndex(-1);
      setStatuses(["none", "none", "none", "none"]);
      setRunState(false);
      setMessage(e?.message || "Uventet feil. Prøv igjen.");
      pushLog("Kontrollen ble avbrutt fordi en feil oppstod.");
    }
  }

  async function onRunAll() {
    if (!canSubmit || runningRef.current) return;

    if (!email) {
      setGateError("");
      setEmailInput("");
      setShowEmailGate(true);
      return;
    }

    try {
      await beginRun(email);
    } catch (e: any) {
      if (e?.code === "FREE_LIMIT_REACHED") {
        setAccess((e?.access as AccessState | null) ?? access);
        setShowPaywall(true);
        return;
      }

      if (e?.code === "TECHNICAL_REQUIRES_SUBSCRIPTION") {
        setAccess((e?.access as AccessState | null) ?? access);
        setMessage("Teknisk kontroll krever abonnement eller VIP-tilgang.");
        return;
      }

      setMessage(e?.message || "Uventet feil. Prøv igjen.");
    }
  }

  async function onContinueWithEmail() {
    const normalized = normalizeEmail(emailInput);

    if (!isValidEmail(normalized)) {
      setGateError("Oppgi en gyldig e-postadresse.");
      return;
    }

    try {
      setGateBusy(true);
      setGateError("");

      if (typeof window !== "undefined") {
        window.localStorage.setItem(EMAIL_STORAGE_KEY, normalized);
      }

      setEmail(normalized);
      setEmailInput(normalized);
      await refreshAccess(normalized);
      setShowEmailGate(false);

      await beginRun(normalized);
    } catch (e: any) {
      if (e?.code === "FREE_LIMIT_REACHED") {
        setAccess((e?.access as AccessState | null) ?? access);
        setShowEmailGate(false);
        setShowPaywall(true);
        return;
      }

      if (e?.code === "TECHNICAL_REQUIRES_SUBSCRIPTION") {
        setAccess((e?.access as AccessState | null) ?? access);
        setShowEmailGate(false);
        setMessage("Teknisk kontroll krever abonnement eller VIP-tilgang.");
        return;
      }

      setGateError(e?.message || "Kunne ikke starte analyse.");
    } finally {
      setGateBusy(false);
    }
  }

  function onReset() {
    if (isRunning) return;

    clearDraft();
    setTextState("");
    setMessage("");
    setLog([]);
    setActiveIndex(-1);
    setStatuses(["none", "none", "none", "none"]);
    setRunState(false);
    clearStoredResults();
  }

  const primaryLabel = isRunning ? "Kontrollerer…" : "Start kontroll";

  return (
    <section className="space-y-5">
      <EmailGate
        open={showEmailGate}
        email={emailInput}
        setEmail={setEmailInput}
        onClose={() => {
          if (!gateBusy) {
            setShowEmailGate(false);
            setGateError("");
          }
        }}
        onContinue={onContinueWithEmail}
        busy={gateBusy}
        error={gateError}
      />

      <Paywall
        open={showPaywall}
        email={email}
        access={access}
        onClose={() => setShowPaywall(false)}
      />

      <Panel
        eyebrow="Kontroll før publisering"
        title="Få en tydelig vurdering av teksten"
        subtitle="Lim inn teksten og få en samlet vurdering av om den bør publiseres som den står. Phorium vurderer presisjon, konsistens, faktagrunnlag og formell egnethet før endelig konklusjon."
      >
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-[var(--phorium-muted)]">
            4 vurderingsledd
          </span>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-[var(--phorium-muted)]">
            Samlet publiseringsvurdering
          </span>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-[var(--phorium-muted)]">
            Kritiske avvik prioriteres
          </span>

          {email ? (
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-[var(--phorium-muted)]">
              {access?.subscriptionStatus === "active"
                ? "Aktivt abonnement"
                : `Gratis brukt: ${access?.freeRunsUsed ?? 0}/3`}
            </span>
          ) : null}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-relaxed text-[var(--phorium-muted)]">
          En tekst kan se ferdig ut og likevel ikke holde for publisering. Phorium vurderer ikke hvordan teksten kan omskrives, men om den faktisk bør publiseres som den står.
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          eyebrow="Innsending"
          title="Tekst til vurdering"
          subtitle="Lim inn teksten du vil kontrollere. Resultatet samles i én rapport med avvik, merknader og endelig vurdering."
        >
          <Editor
            value={text}
            onChange={onChange}
            disabled={isRunning}
            minChars={MIN_CHARS}
            onSubmit={onRunAll}
          />

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--phorium-muted)]">
                Rapporten viser
              </div>
              <div className="mt-2 text-sm text-[var(--phorium-text)]">
                Kritiske avvik, alvorlige avvik, merknader og endelig vurdering
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--phorium-muted)]">
                Vurderingsgrunnlag
              </div>
              <div className="mt-2 text-sm text-[var(--phorium-text)]">
                Presisjon, konsistens, faktagrunnlag og formell egnethet
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onRunAll}
                disabled={!canSubmit || isRunning}
                className={[
                  "inline-flex min-w-[170px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold",
                  "bg-[var(--phorium-accent)] text-[#11140f]",
                  "shadow-[0_16px_50px_rgba(0,0,0,0.5)] ring-1 ring-black/10 transition-all",
                  "hover:brightness-105 active:brightness-95",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                ].join(" ")}
              >
                {primaryLabel}
              </button>

              <button
                type="button"
                onClick={onReset}
                disabled={isRunning}
                className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-[var(--phorium-muted)] transition hover:bg-white/[0.09] hover:text-[var(--phorium-text)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Nullstill
              </button>
            </div>

            <div className="text-xs text-[var(--phorium-muted)]">{stepText}</div>
          </div>

          {message && (
            <div className="mt-4 text-sm text-[color:var(--phorium-bad)]">{message}</div>
          )}
        </Panel>

        <div className="space-y-5">
          <ScanIndicator activeIndex={activeIndex} statuses={statuses} />

          <Panel
            eyebrow="Tilleggsmodul"
            title="Teknisk kontroll"
            subtitle="Tilleggsmodul for stavefeil, grammatikk, tegnsetting og typografi."
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-xs text-[var(--phorium-muted)]">
                {effectiveCanUseTechnical
                  ? "Kan inkluderes i kontrollflyten."
                  : "Tilgjengelig med abonnement."}
              </div>

              <label className="inline-flex select-none items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeTechnical}
                  onChange={(e) => setIncludeTechnical(e.target.checked)}
                  disabled={!effectiveCanUseTechnical || isRunning}
                  className="h-4 w-4 accent-[var(--phorium-accent)] disabled:opacity-50"
                />
                <span className="text-xs text-[var(--phorium-muted)]">
                  {effectiveCanUseTechnical ? "Inkluder" : "Pro"}
                </span>
              </label>
            </div>
          </Panel>

          <SystemLog lines={log} running={isRunning} />
        </div>
      </div>
    </section>
  );
}