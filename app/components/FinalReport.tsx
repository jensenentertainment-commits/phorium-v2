"use client";

import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";

type Severity = "critical" | "major" | "minor";
type Category = "precision" | "consistency" | "fact" | "tone";

type Issue = {
  code: string;
  severity: Severity;
  category: Category;
  message: string;
  evidence?: string;
};

type StoredStep =
  | {
      pass: boolean;
      issues?: Issue[];
      bullets?: string[]; // legacy
      submittedText?: string;
      submittedAt?: number;
    }
  | null;

function readStep(key: string): StoredStep {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const pass = typeof parsed?.pass === "boolean" ? parsed.pass : null;
    if (pass === null) return null;

    const bullets = Array.isArray(parsed?.bullets)
      ? parsed.bullets
          .filter((x: unknown) => typeof x === "string")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .slice(0, 200)
      : [];

    const issuesRaw = parsed?.issues;
    const issues: Issue[] = Array.isArray(issuesRaw)
      ? issuesRaw
          .filter((x: any) => x && typeof x === "object")
          .map((x: any) => ({
            code: typeof x.code === "string" ? x.code.trim() : "",
            severity: x.severity as Severity,
            category: x.category as Category,
            message: typeof x.message === "string" ? x.message.trim() : "",
            evidence: typeof x.evidence === "string" ? x.evidence.trim() : undefined,
          }))
          .filter(
            (i: Issue) =>
              !!i.code &&
              !!i.message &&
              ["critical", "major", "minor"].includes(i.severity) &&
              ["precision", "consistency", "fact", "tone"].includes(i.category)
          )
          .slice(0, 400)
      : [];

    const submittedText =
      typeof parsed?.submittedText === "string" ? parsed.submittedText : undefined;

    const submittedAt =
      typeof parsed?.submittedAt === "number" ? parsed.submittedAt : undefined;

    return { pass, issues, bullets, submittedText, submittedAt };
  } catch {
    return null;
  }
}

function readDraft(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("phorium:draft") || "";
}

function statusText(v: StoredStep) {
  if (!v) return "Ikke kjørt";
  return v.pass ? "OK" : "Avvik";
}

function badgeClasses(v: StoredStep) {
  if (!v) return "border-white/10 bg-white/5 text-[var(--phorium-muted)]";
  return v.pass
    ? "border-[color:var(--phorium-ok)] bg-[var(--phorium-ok-bg)] text-[color:var(--phorium-ok)]"
    : "border-[color:var(--phorium-bad)] bg-[var(--phorium-bad-bg)] text-[color:var(--phorium-bad)]";
}

function cardToneClasses(v: StoredStep) {
  if (!v) return "border-white/10 bg-black/20";
  return v.pass
    ? "border-[color:var(--phorium-ok)]/60 bg-[var(--phorium-ok-bg)]"
    : "border-[color:var(--phorium-bad)]/60 bg-[var(--phorium-bad-bg)]";
}

function bulletDotClass(v: StoredStep) {
  if (!v) return "text-[var(--phorium-muted)]";
  return v.pass ? "text-[color:var(--phorium-ok)]" : "text-[color:var(--phorium-bad)]";
}

function normalizeKey(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").replace(/[“”"']/g, "").trim();
}

type AggItem = {
  key: string;
  code: string;
  severity: Severity;
  category: Category;
  message: string;
  evidence?: string;
  steps: string[];
};

function severityRank(s: Severity) {
  if (s === "critical") return 0;
  if (s === "major") return 1;
  return 2;
}

function severityLabel(s: Severity) {
  if (s === "critical") return "Kritisk";
  if (s === "major") return "Alvorlig";
  return "Merknad";
}

function categoryLabel(c: Category) {
  if (c === "precision") return "Presisjon";
  if (c === "consistency") return "Konsistens";
  if (c === "fact") return "Faktagrunnlag";
  return "Tone";
}

function stepTag(stepName: string) {
  if (stepName.startsWith("Pres")) return "Presisjon";
  if (stepName.startsWith("Kons")) return "Konsistens";
  if (stepName.startsWith("Fakt")) return "Faktagr.";
  if (stepName.startsWith("Publ")) return "Publ.";
  if (stepName.startsWith("Tekn")) return "Teknisk";
  return stepName;
}

function titleForStep(step: string) {
  if (step === "Teknisk") return "Teknisk";
  if (step === "Publ.") return "Publ.";
  if (step === "Faktagr.") return "Faktagr.";
  if (step === "Konsistens") return "Konsistens";
  if (step === "Presisjon") return "Presisjon";
  return step;
}

type TabKey = "all" | "critical" | "major" | "technical" | "minor";

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-xs transition",
        active
          ? "border-white/20 bg-white/10 text-[var(--phorium-text)]"
          : "border-white/10 bg-white/5 text-[var(--phorium-muted)] hover:bg-white/10 hover:text-[var(--phorium-text)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs tracking-[0.22em] uppercase text-[var(--phorium-muted)]">
              {title}
            </div>
            {subtitle ? (
              <div className="mt-2 text-sm text-[var(--phorium-muted)]">{subtitle}</div>
            ) : null}
          </div>

          <span
            className={[
              "inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs transition",
              open
                ? "border-white/20 bg-white/10 text-[var(--phorium-text)]"
                : "border-white/10 bg-white/5 text-[var(--phorium-muted)] hover:bg-white/10 hover:text-[var(--phorium-text)]",
            ].join(" ")}
          >
            {open ? "Skjul" : "Vis"}
          </span>
        </div>
      </button>

      {open ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function FinalReport() {
  const [presisjon, setPresisjon] = useState<StoredStep>(null);
  const [konsistens, setKonsistens] = useState<StoredStep>(null);
  const [faktagrunnlag, setFaktagrunnlag] = useState<StoredStep>(null);
  const [publiseringsklar, setPubliseringsklar] = useState<StoredStep>(null);
  const [teknisk, setTeknisk] = useState<StoredStep>(null);
  const [draft, setDraftState] = useState<string>("");

  const [tab, setTab] = useState<TabKey>("all");
  const [q, setQ] = useState("");
  const [openExcerpt, setOpenExcerpt] = useState(true);
  const [openSteps, setOpenSteps] = useState(true);
  const [openIssues, setOpenIssues] = useState(true);

  useEffect(() => {
    const update = () => {
      setPresisjon(readStep("phorium:presisjon"));
      setKonsistens(readStep("phorium:konsistens"));
      setFaktagrunnlag(readStep("phorium:faktagrunnlag"));
      setPubliseringsklar(readStep("phorium:publiseringsklar"));
      setTeknisk(readStep("phorium:tekniskkontroll"));
      setDraftState(readDraft());
    };

    update();
    window.addEventListener("focus", update);
    window.addEventListener("storage", update);

    const t = window.setTimeout(update, 120);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("focus", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const anyRun = useMemo(() => {
    return !!(presisjon || konsistens || faktagrunnlag || publiseringsklar || teknisk);
  }, [presisjon, konsistens, faktagrunnlag, publiseringsklar, teknisk]);

  const steps = useMemo(() => {
    const base = [
      { name: "Presisjonskontroll", v: presisjon },
      { name: "Konsistenskontroll", v: konsistens },
      { name: "Faktagrunnlag", v: faktagrunnlag },
      { name: "Publiseringsklar", v: publiseringsklar },
    ];
    return teknisk ? [...base, { name: "Teknisk kontroll", v: teknisk }] : base;
  }, [presisjon, konsistens, faktagrunnlag, publiseringsklar, teknisk]);

  const reportText = useMemo(() => {
    const ordered = [publiseringsklar, faktagrunnlag, konsistens, presisjon, teknisk].filter(
      Boolean
    ) as Array<NonNullable<StoredStep>>;

    for (const s of ordered) {
      const t = (s.submittedText ?? "").trim();
      if (t) return t;
    }
    return draft || "";
  }, [publiseringsklar, faktagrunnlag, konsistens, presisjon, teknisk, draft]);

  const aggregated = useMemo<AggItem[]>(() => {
    const sources: Array<{ step: string; v: StoredStep }> = [
      { step: "Presisjonskontroll", v: presisjon },
      { step: "Konsistenskontroll", v: konsistens },
      { step: "Faktagrunnlag", v: faktagrunnlag },
      { step: "Publiseringsklar", v: publiseringsklar },
      { step: "Teknisk kontroll", v: teknisk },
    ];

    const map = new Map<
      string,
      {
        code: string;
        severity: Severity;
        category: Category;
        message: string;
        evidence?: string;
        steps: Set<string>;
      }
    >();

    for (const s of sources) {
      const step = stepTag(s.step);
      const issues = s.v?.issues ?? [];

      if (issues.length > 0) {
        for (const i of issues) {
          const evNorm = normalizeKey(i.evidence ?? "");
          const msgNorm = normalizeKey(i.message);

          const key =
            evNorm.length >= 6
              ? `EV::${evNorm}::${i.category}`
              : `MSG::${i.code}::${msgNorm}`;

          const existing = map.get(key);

          if (!existing) {
            map.set(key, {
              code: i.code,
              severity: i.severity,
              category: i.category,
              message: i.message,
              evidence: i.evidence,
              steps: new Set([step]),
            });
          } else {
            existing.steps.add(step);
            if (severityRank(i.severity) < severityRank(existing.severity)) {
              existing.severity = i.severity;
            }
            if (!existing.evidence && i.evidence) existing.evidence = i.evidence;
            if (i.message && (!existing.message || i.message.length < existing.message.length)) {
              existing.message = i.message;
              existing.code = i.code;
              existing.category = i.category;
            }
          }
        }
        continue;
      }

      const bullets = s.v?.bullets ?? [];
      const inferredCategory: Category =
        s.step.startsWith("Pres")
          ? "precision"
          : s.step.startsWith("Kons")
          ? "consistency"
          : s.step.startsWith("Fakt")
          ? "fact"
          : "tone";

      for (const b of bullets) {
        const msg = b.trim();
        if (!msg) continue;

        const key = `LEGACY::${normalizeKey(msg)}::${inferredCategory}`;
        const existing = map.get(key);

        if (!existing) {
          map.set(key, {
            code: "LEGACY",
            severity: "major",
            category: inferredCategory,
            message: msg,
            steps: new Set([step]),
          });
        } else {
          existing.steps.add(step);
        }
      }
    }

    const items: AggItem[] = Array.from(map.entries()).map(([key, v]) => ({
      key,
      code: v.code,
      severity: v.severity,
      category: v.category,
      message: v.message,
      evidence: v.evidence,
      steps: Array.from(v.steps),
    }));

    items.sort((a, b) => {
      const d = severityRank(a.severity) - severityRank(b.severity);
      if (d !== 0) return d;
      const c = a.category.localeCompare(b.category);
      if (c !== 0) return c;
      return a.message.localeCompare(b.message);
    });

    return items.slice(0, 600);
  }, [presisjon, konsistens, faktagrunnlag, publiseringsklar, teknisk]);

  const criticalItems = useMemo(() => aggregated.filter((a) => a.severity === "critical"), [aggregated]);
  const majorItems = useMemo(() => aggregated.filter((a) => a.severity === "major"), [aggregated]);
  const minorItems = useMemo(() => aggregated.filter((a) => a.severity === "minor"), [aggregated]);

  const technicalMinorItems = useMemo(
    () => aggregated.filter((a) => a.steps.includes("Teknisk") && a.severity === "minor"),
    [aggregated]
  );

  const nonTechnicalMinorItems = useMemo(
    () => aggregated.filter((a) => a.severity === "minor" && !a.steps.includes("Teknisk")),
    [aggregated]
  );

const computedVerdict = useMemo(() => {
  if (!anyRun) return null;

  if (criticalItems.length > 0) return false;

  if (majorItems.length >= 3) return false;

  if (publiseringsklar?.pass === false) return false;

  return true;
}, [anyRun, criticalItems.length, majorItems.length, publiseringsklar]);

const riskLevel = useMemo(() => {
  if (criticalItems.length > 0) return "Høy";
  if (majorItems.length >= 3) return "Høy";
  if (majorItems.length >= 1) return "Moderat";
  return "Lav";
}, [criticalItems.length, majorItems.length]);

  const verdictNote = useMemo(() => {
    if (!anyRun) return "Ingen steg er kjørt. Kjør kontrollflyten for å generere rapport.";
    if (computedVerdict === null) return "Sluttvurdering er ikke tilgjengelig.";
    if (computedVerdict === true) return "Teksten vurderes publiseringsklar etter gjeldende standard.";
    return "Publisering frarådes før registrerte avvik er rettet.";
  }, [anyRun, computedVerdict]);

  const verdictRule = useMemo(() => {
    if (!anyRun || computedVerdict === null) return "";
    return computedVerdict
      ? "Kriterier: Ingen kritiske avvik og færre enn 3 alvorlige."
      : "Kriterier: Kritiske avvik eller minst 3 alvorlige utløser ikke publiseringsklar.";
  }, [anyRun, computedVerdict]);
<div className="text-sm text-[var(--phorium-muted)]">
  Risiko: {riskLevel}
</div>
  const countsLine = useMemo(() => {
    const techMinorCount = technicalMinorItems.length;
    const notesMinorCount = nonTechnicalMinorItems.length;
    return `Kritiske: ${criticalItems.length} • Alvorlige: ${majorItems.length} • Tekniske: ${techMinorCount} • Merknader: ${notesMinorCount}`;
  }, [criticalItems.length, majorItems.length, technicalMinorItems.length, nonTechnicalMinorItems.length]);

  const filteredItems = useMemo(() => {
    let base = aggregated;

    if (tab === "critical") base = base.filter((x) => x.severity === "critical");
    if (tab === "major") base = base.filter((x) => x.severity === "major");
    if (tab === "technical") base = base.filter((x) => x.steps.includes("Teknisk") && x.severity === "minor");
    if (tab === "minor") base = base.filter((x) => x.severity === "minor" && !x.steps.includes("Teknisk"));

    const qq = normalizeKey(q);
    if (!qq) return base;

    return base.filter((x) => {
      const hay = normalizeKey(
        [x.message, x.evidence ?? "", categoryLabel(x.category), x.steps.join(" ")].join(" ")
      );
      return hay.includes(qq);
    });
  }, [aggregated, tab, q]);

  function downloadPdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const marginX = 52;
    const topY = 56;
    const footerH = 56;
    const bottomLimit = pageH - footerH;
    const maxW = pageW - marginX * 2;

    const colors = {
      ink: [16, 24, 22] as const,
      muted: [92, 110, 104] as const,
      border: [210, 220, 216] as const,
      ok: [46, 125, 97] as const,
      okBg: [231, 247, 241] as const,
      bad: [170, 74, 74] as const,
      badBg: [253, 238, 238] as const,
      chip: [245, 247, 246] as const,
    };

    const now = new Date();
    const dateStr = now.toLocaleString("no-NO", { dateStyle: "short", timeStyle: "medium" });

    const controlId =
      "PHR-" +
      now
        .toISOString()
        .replace(/[-:]/g, "")
        .replace("T", "-")
        .slice(0, 15);

    let y = topY;
    let pageNo = 1;

    const setTextColor = (rgb: readonly number[]) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    const setDrawColor = (rgb: readonly number[]) => doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    const setFillColor = (rgb: readonly number[]) => doc.setFillColor(rgb[0], rgb[1], rgb[2]);

    function drawFooter() {
      const y1 = pageH - 40;
      const y2 = pageH - 24;

      doc.setFontSize(9);
      setTextColor(colors.muted);

      doc.setFont("helvetica", "italic");
      doc.text("Kontroll utført etter Phorium Text Control Standard v1.0", marginX, y1);

      doc.setFont("helvetica", "bold");
      doc.text("Phorium", marginX, y2);

      doc.setFont("helvetica", "normal");
      doc.text(`• ${controlId}`, marginX + 44, y2);

      doc.text(`Side ${pageNo}`, pageW - marginX, y2, { align: "right" });
    }

    function ensureSpace(need: number) {
      if (y + need <= bottomLimit) return;

      drawFooter();
      doc.addPage();

      pageNo += 1;
      y = topY;

      drawHeader(true);
    }

    const remaining = () => bottomLimit - y;

    function keepTogether(need: number) {
      if (remaining() >= need) return;

      drawFooter();
      doc.addPage();

      pageNo += 1;
      y = topY;

      drawHeader(true);
    }

    function drawHeader(continued = false) {
      setDrawColor(colors.border);
      doc.setLineWidth(1);

      doc.line(marginX, y, pageW - marginX, y);
      y += 18;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      setTextColor(colors.ink);

      doc.text(
        continued ? "Phorium – Kontrollrapport (forts.)" : "Phorium – Kontrollrapport",
        marginX,
        y
      );

      y += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      setTextColor(colors.muted);

      doc.text(`Generert: ${dateStr}`, marginX, y);
      doc.text(`Kontroll-ID: ${controlId}`, pageW - marginX, y, { align: "right" });

      y += 14;

      const textLength = reportText ? reportText.length : 0;
      const controlsRun = steps.filter((s) => s.v).length;

      const meta =
        `Standard: Phorium Text Control v1.0 • ` +
        `Analysert tekst: ${textLength.toLocaleString("no-NO")} tegn • ` +
        `Kontroller kjørt: ${controlsRun}`;

      doc.setFontSize(9);
      const lines = doc.splitTextToSize(meta, maxW);
      for (const ln of lines) {
        doc.text(ln, marginX, y);
        y += 12;
      }

      y += 4;
      setDrawColor(colors.border);
      doc.line(marginX, y, pageW - marginX, y);

      y += 22;
    }

    const sectionTitle = (title: string) => {
      ensureSpace(34);

      setFillColor(colors.chip);
      doc.rect(marginX - 6, y - 10, 3, 22, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      setTextColor(colors.ink);

      doc.text(title, marginX, y);

      y += 10;

      setDrawColor(colors.border);
      doc.line(marginX, y, pageW - marginX, y);

      y += 16;
    };

    const paragraph = (text: string, fontSize = 11) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSize);
      setTextColor(colors.ink);

      const lines = doc.splitTextToSize(text, maxW);
      for (const line of lines) {
        ensureSpace(16);
        doc.text(line, marginX, y);
        y += 14;
      }
    };

    const bulletList = (items: string[], tone: "bad" | "ok" | "neutral") => {
      const dotColor = tone === "bad" ? colors.bad : tone === "ok" ? colors.ok : colors.muted;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      const indent = 14;
      const bulletMaxW = maxW - indent;

      for (const item of items) {
        const lines = doc.splitTextToSize(item, bulletMaxW);

        ensureSpace(18);
        setTextColor(dotColor);
        doc.text("•", marginX, y);

        setTextColor(colors.ink);
        doc.text(lines[0], marginX + indent, y);
        y += 14;

        for (let i = 1; i < lines.length; i++) {
          ensureSpace(16);
          doc.text(lines[i], marginX + indent, y);
          y += 14;
        }

        y += 2;
      }

      y += 6;
    };

    drawHeader(false);

    sectionTitle("Endelig vurdering");

    const boxStartY = y - 10;
    setFillColor(colors.chip);
    setDrawColor(colors.border);
    doc.roundedRect(marginX - 6, boxStartY, maxW + 12, 86, 10, 10, "FD");

    const statusLabel =
      computedVerdict === null
        ? "Ikke kjørt"
        : computedVerdict
        ? "Publiseringsklar"
        : "Ikke publiseringsklar";

    const riskLabel =
      computedVerdict === null
        ? "–"
        : criticalItems.length > 0 || majorItems.length >= 3
        ? "Høy"
        : majorItems.length > 0
        ? "Moderat"
        : minorItems.length >= 3
        ? "Lav"
        : "Minimal";

    ensureSpace(34);

    const barKind =
      computedVerdict === null ? "neutral" : computedVerdict ? "ok" : "bad";

    setFillColor(barKind === "ok" ? colors.okBg : barKind === "bad" ? colors.badBg : colors.chip);
    setDrawColor(barKind === "ok" ? colors.ok : barKind === "bad" ? colors.bad : colors.border);

    doc.roundedRect(marginX, y - 12, maxW, 26, 10, 10, "FD");

    setTextColor(barKind === "ok" ? colors.ok : barKind === "bad" ? colors.bad : colors.muted);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Status: ${statusLabel} • Risiko: ${riskLabel}`, marginX + 12, y + 6);

    y += 28;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setTextColor(colors.muted);
    doc.text(countsLine, marginX + 12, y);

    y += 16;

    if (verdictRule) {
      const ruleLines = doc.splitTextToSize(verdictRule, maxW - 24);
      for (const ln of ruleLines) {
        ensureSpace(14);
        doc.text(ln, marginX + 12, y);
        y += 12;
      }
      y += 10;
    } else {
      y += 10;
    }

    const trimmed = (reportText || "").trim();
    if (trimmed.length) {
      sectionTitle("Tekst (utdrag)");

      setTextColor(colors.muted);
      doc.setFontSize(10);
      doc.text("Viser et kort utdrag av innsendt tekst.", marginX, y);
      y += 14;

      const excerpt = trimmed.length > 900 ? trimmed.slice(0, 900) + "…" : trimmed;
      paragraph(excerpt, 10);
      y += 6;
    }

    sectionTitle("Registrerte avvik");
    setTextColor(colors.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Avvik er deduplisert og strukturert etter alvorlighetsgrad og kategori.", marginX, y);
    y += 14;

    const mkLines = (items: AggItem[]) =>
      items.map((a) => {
        const ev = a.evidence ? ` («${a.evidence}»)` : "";
        const cat = ` [${categoryLabel(a.category)}]`;
        const src = a.steps.length > 0 ? ` (Funnet i: ${a.steps.join(", ")})` : "";
        return `${a.message}${ev}${cat}${src}`;
      });

    if (!aggregated.length) {
      setTextColor(colors.ok);
      doc.setFont("helvetica", "bold");
      doc.text("Ingen registrerte avvik.", marginX, y);
      y += 16;
    } else {
      if (criticalItems.length) {
        keepTogether(90);
        setTextColor(colors.bad);
        doc.setFont("helvetica", "bold");
        doc.text("Kritiske avvik", marginX, y);
        y += 16;
        bulletList(mkLines(criticalItems), "bad");
      }

      if (majorItems.length) {
        keepTogether(90);
        setTextColor(colors.muted);
        doc.setFont("helvetica", "bold");
        doc.text("Alvorlige avvik", marginX, y);
        y += 16;
        bulletList(mkLines(majorItems), "neutral");
      }

      if (technicalMinorItems.length) {
        keepTogether(90);
        setTextColor(colors.muted);
        doc.setFont("helvetica", "bold");
        doc.text("Teknisk", marginX, y);
        y += 16;
        bulletList(mkLines(technicalMinorItems), "neutral");
      }

      if (nonTechnicalMinorItems.length) {
        keepTogether(90);
        setTextColor(colors.muted);
        doc.setFont("helvetica", "bold");
        doc.text("Merknader", marginX, y);
        y += 16;
        bulletList(mkLines(nonTechnicalMinorItems), "neutral");
      }
    }

    drawFooter();
    doc.save("phorium-rapport.pdf");
  }

  const verdictLabel =
    computedVerdict === null
      ? "Ikke kjørt"
      : computedVerdict
      ? "Publiseringsklar"
      : "Ikke publiseringsklar";

  const verdictPillClass =
    computedVerdict === null
      ? "border-white/10 bg-white/5 text-[var(--phorium-muted)]"
      : computedVerdict
      ? "border-[color:var(--phorium-ok)] bg-[var(--phorium-ok-bg)] text-[color:var(--phorium-ok)]"
      : "border-[color:var(--phorium-bad)] bg-[var(--phorium-bad-bg)] text-[color:var(--phorium-bad)]";

  const excerpt = useMemo(() => {
    const t = reportText.trim();
    if (!t) return "";
    return t.length > 900 ? t.slice(0, 900) + "…" : t;
  }, [reportText]);

  return (
    <section className="space-y-4">
      {/* Sticky mini header */}
      <div className="sticky top-3 z-20">
        <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-3 backdrop-blur sm:px-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] tracking-[0.22em] uppercase text-[var(--phorium-muted)]">
                Kontrollrapport
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[var(--phorium-text)]">
                  {verdictLabel}
                </span>

                <span
                  className={[
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px]",
                    verdictPillClass,
                  ].join(" ")}
                >
                  {anyRun ? "Generert" : "Ingen data"}
                </span>

                {anyRun && (
                  <span className="hidden sm:inline text-xs text-[var(--phorium-muted)]">
                    {countsLine}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={downloadPdf}
              className="inline-flex items-center justify-center rounded-full px-4 sm:px-5 py-2.5 text-sm font-semibold border border-white/10 bg-white/5 text-[var(--phorium-text)] hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!anyRun}
              title={!anyRun ? "Kjør minst ett steg for å generere PDF." : "Last ned kontrollrapport som PDF."}
            >
              Last ned PDF
            </button>
          </div>
        </div>
      </div>

      {/* Verdict card */}
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs tracking-[0.22em] uppercase text-[var(--phorium-muted)]">
              Endelig vurdering
            </div>

            <div className="mt-2 text-lg font-semibold text-[var(--phorium-text)]">
              {verdictLabel}
            </div>

            <div className="mt-2 text-xs text-[var(--phorium-muted)]">
              Phorium Standard v1 • {aggregated.length} registrerte avvik
            </div>

            <div className="mt-2 text-sm text-[var(--phorium-muted)]">
              {verdictNote}
            </div>

            {verdictRule && (
              <div className="mt-2 text-xs text-[var(--phorium-muted)]">
                {verdictRule}
              </div>
            )}

            {computedVerdict === false && (
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[var(--phorium-muted)]">
                {criticalItems.length > 0 && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {criticalItems.length} kritiske
                  </span>
                )}
                {majorItems.length > 0 && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {majorItems.length} alvorlige
                  </span>
                )}
                {technicalMinorItems.length > 0 && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {technicalMinorItems.length} tekniske
                  </span>
                )}
                {nonTechnicalMinorItems.length > 0 && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {nonTechnicalMinorItems.length} merknader
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={downloadPdf}
            className="hidden sm:inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold border border-white/10 bg-white/5 text-[var(--phorium-text)] hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!anyRun}
          >
            Last ned PDF
          </button>
        </div>
      </div>

      {/* Excerpt */}
      {excerpt && (
        <Section
          title="Tekst (utdrag)"
          subtitle="Viser et kort utdrag av teksten som ble kontrollert."
          open={openExcerpt}
          onToggle={() => setOpenExcerpt((v) => !v)}
        >
          <div className="text-sm text-[var(--phorium-text)] leading-relaxed whitespace-pre-wrap">
            {excerpt}
          </div>
        </Section>
      )}

      {/* Steps */}
      <Section
        title="Kontrollsteg"
        subtitle="Oppsummering per kontrollsteg."
        open={openSteps}
        onToggle={() => setOpenSteps((v) => !v)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((x) => (
            <div
              key={x.name}
              className={[
                "rounded-3xl border p-4 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
                "transition",
                cardToneClasses(x.v),
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-[var(--phorium-text)]">
                  {x.name}
                </div>

                <span
                  className={[
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px]",
                    badgeClasses(x.v),
                  ].join(" ")}
                >
                  {statusText(x.v)}
                </span>
              </div>

              {x.v?.issues?.length ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {x.v.issues.slice(0, 5).map((i, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={bulletDotClass(x.v)}>•</span>
                      <span className="text-[var(--phorium-text)]">{i.message}</span>
                    </li>
                  ))}
                  {x.v.issues.length > 5 && (
                    <li className="text-xs text-[var(--phorium-muted)]">
                      + {x.v.issues.length - 5} flere avvik
                    </li>
                  )}
                </ul>
              ) : x.v?.bullets?.length ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {x.v.bullets.slice(0, 5).map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={bulletDotClass(x.v)}>•</span>
                      <span className="text-[var(--phorium-text)]">{b}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 text-sm text-[var(--phorium-muted)]">
                  {x.v ? "Ingen avvik registrert." : "Steget er ikke kjørt ennå."}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Aggregated */}
      <Section
        title="Registrerte avvik"
        subtitle="Avvik er deduplisert og strukturert. Bruk filtrering og søk for å navigere raskt."
        open={openIssues}
        onToggle={() => setOpenIssues((v) => !v)}
      >
        {!anyRun ? (
          <div className="text-sm text-[var(--phorium-muted)]">
            Ingen data tilgjengelig. Kjør kontrollflyten for å generere avvik.
          </div>
        ) : aggregated.length === 0 ? (
          <div className="text-sm text-[color:var(--phorium-ok)]">Ingen registrerte avvik.</div>
        ) : (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <TabButton active={tab === "all"} onClick={() => setTab("all")}>
                  Alle ({aggregated.length})
                </TabButton>
                <TabButton active={tab === "critical"} onClick={() => setTab("critical")}>
                  Kritiske ({criticalItems.length})
                </TabButton>
                <TabButton active={tab === "major"} onClick={() => setTab("major")}>
                  Alvorlige ({majorItems.length})
                </TabButton>
                <TabButton active={tab === "technical"} onClick={() => setTab("technical")}>
                  Teknisk ({technicalMinorItems.length})
                </TabButton>
                <TabButton active={tab === "minor"} onClick={() => setTab("minor")}>
                  Merknader ({nonTechnicalMinorItems.length})
                </TabButton>
              </div>

              <div className="flex w-full sm:w-auto items-center gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Søk i avvik…"
                  className="w-full sm:w-64 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-[var(--phorium-text)] placeholder:text-[var(--phorium-muted)] focus:outline-none focus:ring-2 focus:ring-white/10"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--phorium-muted)] hover:bg-white/10 hover:text-[var(--phorium-text)] transition"
                    title="Tøm søk"
                  >
                    Tøm
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-[var(--phorium-muted)]">
              Viser {filteredItems.length} av {aggregated.length}.
            </div>

            <ul className="mt-4 space-y-3 text-sm">
              {filteredItems.map((a) => (
                <li key={a.key} className="flex items-start gap-3">
                  <span
                    className={[
                      "leading-6",
                      a.severity === "critical"
                        ? "text-[color:var(--phorium-bad)]"
                        : "text-[var(--phorium-muted)]",
                    ].join(" ")}
                  >
                    •
                  </span>
                  <div className="min-w-0">
                    <div className="text-[var(--phorium-text)] leading-relaxed">
                      {a.message}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[var(--phorium-muted)]">
                        {severityLabel(a.severity)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[var(--phorium-muted)]">
                        {categoryLabel(a.category)}
                      </span>

                      {a.steps.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[var(--phorium-muted)]"
                        >
                          {titleForStep(s)}
                        </span>
                      ))}
                    </div>

                    {a.evidence && (
                      <div className="mt-2 text-xs text-[var(--phorium-muted)]">
                        «{a.evidence}»
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 text-xs text-[var(--phorium-muted)]">
              Avvik er deduplisert (evidence-first) og sortert etter alvorlighet.
            </div>
          </>
        )}
      </Section>
    </section>
  );
}