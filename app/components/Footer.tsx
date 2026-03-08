import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24">
      <div className="mx-auto w-full max-w-6xl px-4 pb-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(9,16,14,0.72)] shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl">
          {/* Main */}
          <div className="grid gap-0 lg:grid-cols-[1.35fr_0.95fr]">
            {/* Left */}
            <div className="border-b border-white/8 px-6 py-8 md:px-8 md:py-10 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-4">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <span className="text-sm font-semibold text-[var(--phorium-text)]">
                    P
                  </span>
                  <div className="absolute inset-[1px] rounded-[15px] ring-1 ring-white/5" />
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--phorium-muted)]">
                    Phorium
                  </div>
                  <div className="mt-1 text-base font-medium text-[var(--phorium-text)]">
                    Kontrollsystem
                  </div>
                </div>
              </div>

              <div className="mt-8 max-w-xl">
                <p className="text-lg leading-relaxed text-[var(--phorium-text)] md:text-[1.15rem]">
                  Siste kontroll før publisering.
                </p>

                <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--phorium-muted)]">
                  Phorium vurderer tekst i en fast kontrollramme og samler
                  resultatet i én kontrollrapport. Utformet for tydeligere
                  innhold, færre svakheter og mer presis publisering.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-[var(--phorium-muted)]">
                  Phorium Standard
                </span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-[var(--phorium-muted)]">
                  4 vurderingsledd
                </span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-[var(--phorium-muted)]">
                  Én rapport
                </span>
              </div>
            </div>

            {/* Right */}
            <div className="px-6 py-8 md:px-8 md:py-10">
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--phorium-text)]">
                    Navigasjon
                  </div>

                  <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--phorium-muted)]">
                    <Link
                      href="/kontroll"
                      className="transition hover:text-[var(--phorium-text)]"
                    >
                      Start kontroll
                    </Link>

                    <Link
                      href="/standard"
                      className="transition hover:text-[var(--phorium-text)]"
                    >
                      Phorium Standard
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--phorium-text)]">
                    Kontakt
                  </div>

                  <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--phorium-muted)]">
                    <a
                      href="mailto:phorium@jensendigital.no"
                      aria-label="Kontakt Phorium"
                      className="transition hover:text-[var(--phorium-text)]"
                    >
                      phorium@jensendigital.no
                    </a>

                    <Link
                      href="/personvern"
                      className="transition hover:text-[var(--phorium-text)]"
                    >
                      Personvern
                    </Link>

                    <Link
                      href="/vilkar"
                      className="transition hover:text-[var(--phorium-text)]"
                    >
                      Vilkår
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--phorium-muted)]">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--phorium-accent)]" />
                      Fast kontrollramme
                    </span>

                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">
                      Midlertidig tekstbehandling
                    </span>
                  </div>

                  <div className="text-xs leading-relaxed text-[var(--phorium-muted)]">
                    Tekst behandles i kontrollflyten og lagres ikke som
                    permanent innhold.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/8 px-6 py-4 md:px-8">
            <div className="flex flex-col gap-2 text-[10px] text-[var(--phorium-muted)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <span>© {new Date().getFullYear()} Phorium</span>
              <span className="hidden opacity-50 sm:inline">•</span>
              <span>Utviklet av Jensen Digital</span>
              <span className="hidden opacity-50 sm:inline">•</span>
              <span>Org.nr. 97509307</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}