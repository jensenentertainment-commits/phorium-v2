import Link from "next/link";
import { SiteFrame } from "../components/SiteFrame";

export default function PrivacyPage() {
  return (
    <SiteFrame max="max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-semibold">
        Personvern
      </h1>

      <p className="mt-4 max-w-2xl text-[var(--phorium-muted)] leading-relaxed">
        Phorium er bygget for midlertidig og automatisk analyse av tekst før
        publisering. Vi behandler kun opplysninger som er nødvendige for å
        levere kontrollresultatet og håndtere betaling eller kundeforhold der
        det er relevant.
      </p>

      <p className="mt-2 text-xs text-[var(--phorium-muted)]">
        Sist oppdatert: 07.03.2026
      </p>

      <div className="mt-6 grid gap-4">
        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">Behandling av tekst</h2>

          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Tekst som sendes inn i Phorium behandles automatisk for å generere
            et kontrollresultat. Teksten lagres ikke permanent i Phorium.
          </p>

          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Behandlingen skjer kun som del av den aktive analysen. Teksten
            gjennomgås ikke manuelt som del av den ordinære tjenesten.
          </p>

          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Phorium bygger ikke opp en intern teksthistorikk basert på innsendt
            innhold.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">Konto og abonnement</h2>

          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Dersom du oppretter konto eller abonnement, kan Phorium behandle
            opplysninger som navn, e-postadresse, kundestatus og informasjon om
            aktiv plan eller tilgangsnivå.
          </p>

          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Disse opplysningene brukes kun for å administrere tilgang til
            tjenesten, abonnement, kundeoppfølging og nødvendig drift.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">Betaling</h2>

          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Betaling for Phorium håndteres av Stripe. Når du gjennomfører kjøp
            eller oppretter abonnement, behandles betalingsinformasjon av Stripe
            i henhold til deres egne vilkår og personvernrutiner.
          </p>

          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Phorium lagrer ikke full kortinformasjon.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">Lagring og fremtidige funksjoner</h2>

          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Dersom Phorium senere tilbyr lagring av rapporter, team-funksjoner,
            utvidet kontohistorikk eller andre nye funksjoner, vil denne siden
            oppdateres med informasjon om hvilke opplysninger som behandles,
            hvorfor de behandles og hvilke rettigheter du har.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">Kontakt</h2>

          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Spørsmål om personvern eller behandling av opplysninger kan sendes
            til{" "}
            <a
              href="mailto:phorium@jensendigital.no"
              className="text-[var(--phorium-text)] underline underline-offset-4"
            >
              phorium@jensendigital.no
            </a>
            .
          </p>
        </section>
      </div>

      <p className="mt-8 text-xs text-[var(--phorium-muted)]">
        Phorium behandler kun opplysninger som er nødvendige for å levere
        kontrollresultatet, administrere tilgang og håndtere betaling.
      </p>
    </SiteFrame>
  );
}