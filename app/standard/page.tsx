import { SiteFrame } from "../components/SiteFrame";

export default function StandardPage() {
  return (
    
    <SiteFrame max="max-w-4xl">
      <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--phorium-muted)]">
  Phorium Standard
</div>
      <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
        Hva Phorium vurderer
      </h1>

      <p className="mt-4 max-w-2xl leading-relaxed text-[var(--phorium-muted)]">
        Phorium vurderer om en tekst holder for publisering.
        Systemet følger en fast standard for presisjon, konsistens,
        faktagrunnlag og formell egnethet.
      </p>

      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--phorium-muted)]">
        Standarden brukes på tvers av sjangre, for eksempel nettsidetekst,
        pressemelding, rapport, e-post, beskrivelse eller notat.
        Phorium vurderer ikke stilsmak eller personlige preferanser.
      </p>

      <div className="mt-8 grid gap-4">
        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">Phorium vurderer</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--phorium-muted)]">
            <li>• Om påstander er konkrete, tydelige og avgrensede</li>
            <li>• Om tall, begreper og formuleringer henger sammen i teksten</li>
            <li>• Om påstander har et tydelig og etterprøvbart grunnlag</li>
            <li>• Om teksten samlet sett er egnet for formell publisering</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">Phorium vurderer ikke</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--phorium-muted)]">
            <li>• SEO, nøkkelord eller rangering</li>
            <li>• Salgseffekt, markedsføringstrykk eller retoriske grep</li>
            <li>• Kreative omskrivinger som endrer innholdet</li>
            <li>• Personlig smak, stilpreferanser eller merkevareuttrykk</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">4-stegs standard</h2>
          <div className="mt-3 grid gap-3 text-sm text-[var(--phorium-muted)]">
            <div>
              • <span className="text-[var(--phorium-text)]">Presisjon:</span>{" "}
              vurderer uklare formuleringer, vage påstander og manglende avgrensning
            </div>
            <div>
              • <span className="text-[var(--phorium-text)]">Konsistens:</span>{" "}
              vurderer om begreper, tall, tid og opplysninger er interne samsvarende
            </div>
            <div>
              • <span className="text-[var(--phorium-text)]">Faktagrunnlag:</span>{" "}
              vurderer om påstander kan støttes, dokumenteres eller etterprøves
            </div>
            <div>
              • <span className="text-[var(--phorium-text)]">Formell egnethet:</span>{" "}
              avslutter med en samlet vurdering av om teksten bør publiseres som den er
            </div>
          </div>
        </section>
      </div>

      <p className="mt-8 text-xs text-[var(--phorium-muted)]">
        Én innsending. Én samlet vurdering. Ingen omskriving.
      </p>
    </SiteFrame>
  );
}