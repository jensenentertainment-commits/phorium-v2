import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--phorium-bg)] text-[var(--phorium-text)]">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
        <header className="mb-8 md:mb-10">
          <p className="text-xs tracking-[0.22em] uppercase text-[var(--phorium-muted)]">
            PHORIUM PUBLISERINGSKLAR
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-semibold leading-[1.05]">
            Publiseringsklar er en siste, streng vurdering av om en tekst kan publiseres slik den er.
          </h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-[var(--phorium-muted)] leading-relaxed">
            Lim inn faktabasert tekst. Du får enten en publiseringsklar
            versjon. Eller en tydelig beskjed om hva som mangler.
          </p>
        </header>

        {children}

        <footer className="mt-10 md:mt-12 text-xs text-[var(--phorium-muted)]">
          Vurderer nøkternhet, presisjon og struktur. Ikke SEO, tonevalg eller
          “selgende” språk.
        </footer>
      </div>
    </main>
  );
}
