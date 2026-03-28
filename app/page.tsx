import Link from "next/link";

const CONTROL_MODULES = [
  {
    code: "01",
    title: "Presisjon",
    text: "Ser etter uklare, brede eller svake formuleringer som gjør teksten mindre tydelig.",
  },
  {
    code: "02",
    title: "Konsistens",
    text: "Ser etter tall, begreper og opplysninger som ikke henger sammen i teksten.",
  },
  {
    code: "03",
    title: "Faktagrunnlag",
    text: "Ser etter påstander som mangler tydelig, identifiserbart eller etterprøvbart grunnlag.",
  },
  {
    code: "04",
    title: "Formell egnethet",
    text: "Avslutter med en samlet vurdering av om teksten bør publiseres som den står.",
  },
];

const REPORT_ITEMS = [
  {
    label: "Kritisk avvik",
    text: "Motstridende prosjektantall: 5 000 leverte prosjekter i 2024, men 3 000 totalt siden oppstart.",
  },
  {
    label: "Alvorlig avvik",
    text: "Påstand om å være «nummer 1 i Europa» uten identifiserbar og etterprøvbar kilde.",
  },
  {
    label: "Merknad",
    text: "Formuleringen «profesjonelt!!» svekker tonen og fremstår unødvendig forsterket.",
  },
];

const TYPICAL_FINDINGS = [
  "Uklare formuleringer som svekker budskapet",
  "Tall og opplysninger som ikke stemmer overens",
  "Påstander som mangler tydelig grunnlag",
  "Formuleringer som svekker profesjonell troverdighet",
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(10,18,16,0.42)] shadow-[0_24px_80px_rgba(0,0,0,0.30)] backdrop-blur-xl">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.82fr]">
          {/* Left */}
          <div className="relative border-b border-white/8 px-5 py-8 md:px-8 md:py-10 lg:border-b-0 lg:border-r">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full blur-3xl opacity-30"
              style={{
                background:
                  "radial-gradient(circle, rgba(200,183,122,0.22) 0%, rgba(200,183,122,0.06) 42%, rgba(0,0,0,0) 74%)",
              }}
            />

            <div className="relative">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--phorium-muted)]">
                Phorium Standard v1.0
              </div>

              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--phorium-text)] md:text-5xl">
                Oppdag kritiske svakheter før publisering
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--phorium-text)]/90 md:text-[1.1rem]">
                Tekster kan virke klare og profesjonelle, men fortsatt inneholde
                svakheter som svekker troverdighet, skaper uklarhet eller gjør
                påstander vanskelige å stå for. Phorium finner det før publisering.
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--phorium-muted)] md:text-base">
                Phorium omskriver ikke teksten for deg. Systemet vurderer om
                teksten faktisk holder som den står.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-[var(--phorium-muted)]">
                  4 vurderingsledd
                </span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-[var(--phorium-muted)]">
                  Én samlet rapport
                </span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-[var(--phorium-muted)]">
                  Midlertidig tekstbehandling
                </span>
              </div>

              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/kontroll"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[var(--phorium-accent)] px-5 py-2.5 text-sm font-semibold text-[#11140f] shadow-[0_16px_50px_rgba(0,0,0,0.45)] transition hover:brightness-105 active:brightness-95 sm:w-auto"
                >
                  Start kontroll
                </Link>

                <Link
                  href="/standard"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-[var(--phorium-text)] transition hover:bg-white/[0.09] sm:w-auto"
                >
                  Se standard
                </Link>

                <div className="text-xs text-[var(--phorium-muted)]">
                  3 gratis analyser før abonnement
                </div>
              </div>

              <div className="mt-8 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 md:p-5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--phorium-muted)]">
                  Typiske funn
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {TYPICAL_FINDINGS.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/8 bg-black/10 px-3 py-3 text-sm text-[var(--phorium-text)]/90"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="px-5 py-8 md:px-8 md:py-10">
            <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--phorium-muted)]">
                    Kontrollramme
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[var(--phorium-text)]">
                    Fast vurderingsstruktur
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-[var(--phorium-muted)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--phorium-accent)]" />
                  Klar
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {CONTROL_MODULES.map((item) => (
                  <div
                    key={item.code}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-semibold text-[var(--phorium-text)]">
                        {item.code}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--phorium-text)]">
                          {item.title}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--phorium-muted)] md:text-[13px]">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--phorium-muted)]">
                    Innsending
                  </div>
                  <div className="mt-2 text-sm text-[var(--phorium-text)]">
                    Lim inn teksten én gang
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--phorium-muted)]">
                    Resultat
                  </div>
                  <div className="mt-2 text-sm text-[var(--phorium-text)]">
                    Få en samlet publiseringsvurdering
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider strip */}
        <div className="border-t border-white/8 px-5 py-4 md:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--phorium-muted)]">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                Presisjon
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                Konsistens
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                Faktagrunnlag
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                Formell egnethet
              </span>
            </div>

            <div className="text-[11px] text-[var(--phorium-muted)]">
              Vurdering av tekst før publisering
            </div>
          </div>
        </div>
      </section>

      {/* Report section */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(10,18,16,0.34)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl md:p-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--phorium-muted)]">
            Kontrollrapport
          </div>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--phorium-text)]">
            Én rapport før publisering
          </h2>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--phorium-muted)]">
            Etter fullført kontroll samles avvik, merknader og endelig vurdering
            i én rapport. Rapporten er laget for gjennomgang, dokumentasjon og
            beslutning før publisering.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/rapport/eksempel"
              className="inline-flex items-center justify-center rounded-full bg-[var(--phorium-accent)] px-5 py-2.5 text-sm font-semibold text-[#11140f] shadow-[0_16px_50px_rgba(0,0,0,0.45)] transition hover:brightness-105 active:brightness-95"
            >
              Se eksempelrapport
            </Link>

            <Link
              href="/pdf/eksempel.pdf"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-[var(--phorium-text)] transition hover:bg-white/[0.09]"
            >
              Last ned PDF
            </Link>
          </div>

          <p className="mt-4 text-xs text-[var(--phorium-muted)]">
            Eksempelrapporten viser avvik, alvorlighetsgrad og endelig
            publiseringsvurdering.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(10,18,16,0.34)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--phorium-muted)]">
                Endelig vurdering
              </div>
              <div className="mt-1 text-sm font-semibold text-[var(--phorium-text)]">
                Eksempel på rapportutfall
              </div>
            </div>

            <span className="inline-flex self-start rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-[var(--phorium-muted)]">
              Ikke publiseringsklar
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {REPORT_ITEMS.map((item) => (
              <div
                key={item.text}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
              >
                <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--phorium-muted)]">
                  {item.label}
                </div>
                <div className="mt-2 text-sm leading-relaxed text-[var(--phorium-text)]/90">
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}