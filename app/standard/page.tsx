import { SiteFrame } from "../components/SiteFrame";

export default function StandardPage() {
  return (
    <SiteFrame max="max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
        Hva Phorium vurderer
      </h1>

      <p className="mt-4 text-[var(--phorium-muted)] leading-relaxed max-w-2xl">
        Phorium er et kontrollsystem for tekst før publisering.
        Systemet vurderer en fast standard. Ikke stilpreferanser.
      </p>

      <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed max-w-2xl">
        Standarden gjelder uavhengig av sjanger, for eksempel nettsidetekst, pressemelding, rapport, e-post, beskrivelse eller notat.
      </p>

      <div className="mt-8 grid gap-4">
        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">Phorium vurderer</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--phorium-muted)]">
            <li>• Påstander som er konkrete, konsistente og etterprøvbare</li>
            <li>• Nøkternhet og fravær av overdrivelser</li>
            <li>• Begreper og definisjoner brukt konsekvent</li>
            <li>• Helhet (Publiseringsklar): struktur, flyt og prioritering</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">Phorium vurderer ikke</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--phorium-muted)]">
            <li>• SEO, nøkkelord eller rangering</li>
            <li>• Selgende tonevalg eller retoriske grep</li>
            <li>• Kreative omskrivinger som endrer innhold</li>
            <li>• Personlige preferanser og merkevare-stil</li>
          </ul>
        </section>

        {/* Tiny “4-step mapping” (super short) */}
        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">4-stegs standard</h2>
          <div className="mt-3 grid gap-2 text-sm text-[var(--phorium-muted)]">
            <div>• Presisjon: uklarheter, vage formuleringer og utestående premisser</div>
            <div>• Konsistens: begreper, tall, tid og påstander på tvers av teksten</div>
            <div>• Faktagrunnlag: støtte, kildekrav og etterprøvbarhet</div>
            <div>• Publiseringsklar: samlet vurdering og prioriterte avvik</div>
          </div>
        </section>
      </div>

      <p className="mt-8 text-xs text-[var(--phorium-muted)]">
        Én innsending. Én avgjørelse. Ingen “prøv igjen”-loop.
      </p>
    </SiteFrame>
  );
}