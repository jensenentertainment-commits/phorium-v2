"use client";

import * as React from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  minChars?: number;
  hint?: string;
  label?: string;
  placeholder?: string;
  onSubmit?: () => void;
  showWordCount?: boolean;
  showClipboardPaste?: boolean;
  allowClear?: boolean;
};

type ClipStatus = "idle" | "ok" | "denied" | "error";
type SaveStatus = "idle" | "saving" | "saved";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function safeTrimLen(s: string) {
  return s.trim().length;
}

function wordCount(s: string) {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export function Editor({
  value,
  onChange,
  disabled,
  minChars,
  hint,
  label = "Tekst til vurdering",
  placeholder = "Lim inn teksten som skal vurderes før publisering…",
  onSubmit,
  showWordCount = true,
  showClipboardPaste = true,
  allowClear = true,
}: Props) {
  const raw = value ?? "";
  const count = raw.length;
  const effectiveCount = safeTrimLen(raw);
  const words = React.useMemo(
    () => (showWordCount ? wordCount(raw) : 0),
    [raw, showWordCount]
  );

  const ready = typeof minChars === "number" ? effectiveCount >= minChars : true;

  const [mounted, setMounted] = React.useState(false);
  const [clipStatus, setClipStatus] = React.useState<ClipStatus>("idle");
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
  const [focused, setFocused] = React.useState(false);

  const saveTimer = React.useRef<number | null>(null);
  const typedOnceRef = React.useRef(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  function announceSavedSoon() {
    if (!typedOnceRef.current) typedOnceRef.current = true;

    setSaveStatus("saving");

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setSaveStatus("saved");
      saveTimer.current = window.setTimeout(() => setSaveStatus("idle"), 900);
    }, 250);
  }

  const canUseClipboard =
    mounted &&
    showClipboardPaste &&
    typeof navigator !== "undefined" &&
    !!navigator.clipboard?.readText;

  async function pasteFromClipboard() {
    if (disabled || !canUseClipboard) return;

    try {
      const txt = await navigator.clipboard.readText();
      if (typeof txt === "string") {
        onChange(txt);
        announceSavedSoon();
        setClipStatus("ok");
        window.setTimeout(() => setClipStatus("idle"), 1000);
      }
    } catch (e: any) {
      const name = String(e?.name || "").toLowerCase();
      if (name.includes("notallowed") || name.includes("security")) {
        setClipStatus("denied");
      } else {
        setClipStatus("error");
      }
      window.setTimeout(() => setClipStatus("idle"), 1400);
    }
  }

  function clear() {
    if (disabled) return;
    onChange("");
    announceSavedSoon();
  }

  function handleChange(next: string) {
    onChange(next);
    announceSavedSoon();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!onSubmit) return;
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  }

  const autoHint =
    typeof minChars === "number"
      ? ready
        ? "Klar til vurdering."
        : `Lim inn minst ${minChars} tegn for å starte vurderingen.`
      : "";

  const hintText = hint ?? autoHint;

  const hintTone: "ok" | "neutral" =
    typeof minChars === "number" && effectiveCount > 0 && ready ? "ok" : "neutral";

  const saveLabel =
    !typedOnceRef.current
      ? ""
      : saveStatus === "saving"
      ? "Lagrer…"
      : saveStatus === "saved"
      ? "Lagret"
      : "";

  const saveLabelClass =
    saveStatus === "saved"
      ? "text-[color:var(--phorium-ok)]"
      : "text-[var(--phorium-muted)]";

  const clipboardLabel =
    clipStatus === "ok"
      ? "Limt inn"
      : clipStatus === "denied"
      ? "Ikke tillatt"
      : clipStatus === "error"
      ? "Feil"
      : "Lim inn";

  const clipboardTone =
    clipStatus === "ok"
      ? "border-[color:var(--phorium-ok)]/50 bg-[var(--phorium-ok-bg)] text-[color:var(--phorium-ok)]"
      : clipStatus === "denied" || clipStatus === "error"
      ? "border-[color:var(--phorium-bad)]/40 bg-[var(--phorium-bad-bg)] text-[color:var(--phorium-bad)]"
      : "border-white/10 bg-white/[0.04] text-[var(--phorium-muted)] hover:bg-white/[0.08] hover:text-[var(--phorium-text)]";

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.5rem] border bg-black/25 backdrop-blur transition",
          ready ? "border-white/10" : "border-white/15",
          focused ? "ring-2 ring-[var(--phorium-accent)]/20" : "",
          "shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
          disabled && "opacity-70"
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 transition-opacity duration-300",
            focused ? "opacity-100" : "opacity-0"
          )}
        >
          <div
            className="absolute -inset-x-8 -top-8 h-24 blur-2xl"
            style={{
              background:
                "radial-gradient(60% 120% at 50% 0%, color-mix(in srgb, var(--phorium-accent) 30%, transparent) 0%, transparent 72%)",
            }}
          />
        </div>

        <div className="relative z-10 border-b border-white/10 bg-[rgba(10,18,16,0.34)] px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-[var(--phorium-text)]">
                  {label}
                </div>

                {saveLabel ? (
                  <span className={cn("text-[11px] tabular-nums", saveLabelClass)}>
                    {saveLabel}
                  </span>
                ) : null}
              </div>

              {hintText ? (
                <div
                  className={cn(
                    "mt-1 text-xs",
                    hintTone === "ok"
                      ? "text-[color:var(--phorium-ok)]"
                      : "text-[var(--phorium-muted)]"
                  )}
                >
                  {hintText}
                </div>
              ) : null}

              <div className="mt-2 text-xs text-[var(--phorium-muted)]">
                Phorium vurderer om teksten holder for publisering som den står.
              </div>
            </div>

            <div className="text-xs tabular-nums text-[var(--phorium-muted)] sm:text-right">
              {count} tegn
              {showWordCount ? (
                <>
                  {" "}
                  <span className="opacity-60">•</span> {words} ord
                </>
              ) : null}
            </div>
          </div>

          {(canUseClipboard || (allowClear && raw.length > 0)) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {canUseClipboard && (
                <button
                  type="button"
                  onClick={pasteFromClipboard}
                  disabled={disabled}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition",
                    clipboardTone,
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                  title="Lim inn fra utklippstavle"
                >
                  {clipboardLabel}
                </button>
              )}

              {allowClear && raw.length > 0 && (
                <button
                  type="button"
                  onClick={clear}
                  disabled={disabled}
                  className={cn(
                    "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[var(--phorium-muted)] transition",
                    "hover:bg-white/[0.08] hover:text-[var(--phorium-text)]",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                  title="Tøm tekstfelt"
                >
                  Tøm
                </button>
              )}
            </div>
          )}
        </div>

        <div className="relative p-4">
          <textarea
            value={raw}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            rows={16}
            spellCheck={false}
            className={cn(
              "w-full rounded-[1.25rem] border border-white/10 bg-black/40 p-4 text-sm text-[var(--phorium-text)] outline-none",
              "placeholder:text-[var(--phorium-muted)] placeholder:opacity-90",
              "focus:border-white/20 focus:ring-2 focus:ring-[var(--phorium-accent)]/20",
              "disabled:cursor-not-allowed disabled:opacity-60",
              !ready && typeof minChars === "number" ? "border-white/15" : ""
            )}
            placeholder={placeholder}
          />

          {onSubmit ? (
            <div className="mt-3 text-[15px] text-[var(--phorium-muted)]">
              Snarvei: <span className="tabular-nums">Ctrl</span>/<span className="tabular-nums">⌘</span> +{" "}
              <span className="tabular-nums">Enter</span> for å starte vurderingen.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}