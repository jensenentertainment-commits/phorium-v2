import Link from "next/link";

type Step = {
  label: string;
  href: string;
};

export function ToolStepper({
  prev,
  next,
}: {
  prev?: Step;
  next?: Step;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      {prev ? (
        <Link
          href={prev.href}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--phorium-muted)] hover:text-[var(--phorium-text)] hover:bg-white/10 transition"
        >
          ← {prev.label}
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.href}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--phorium-muted)] hover:text-[var(--phorium-text)] hover:bg-white/10 transition"
        >
          Neste: {next.label} →
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}