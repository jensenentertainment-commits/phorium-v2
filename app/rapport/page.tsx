import { FinalReport } from "../components/FinalReport";

export default function ReportPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:py-14">
      <header className="mb-6 md:mb-8">
        <p className="text-xs tracking-[0.22em] uppercase text-[var(--phorium-muted)]">
          Phorium rapport
        </p>

        <h1 className="mt-2 md:mt-3 text-2xl md:text-4xl font-semibold text-[var(--phorium-text)] leading-[1.05]">
         Kontrollrapport
        </h1>

        <p className="mt-3 max-w-2xl text-sm md:text-base text-[var(--phorium-muted)] leading-relaxed">
          Samlet oversikt over presisjon, konsistens, faktagrunnlag og endelig
          publiseringsvurdering.
        </p>
      </header>

      <FinalReport />
    </main>
  );
}