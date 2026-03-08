import { SiteFrame } from "../components/SiteFrame";

export default function TermsPage() {
  return (
    <SiteFrame max="max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-semibold">Vilkår</h1>

      <p className="mt-4 max-w-2xl text-[var(--phorium-muted)] leading-relaxed">
        Phorium er et kontrollsystem for tekst før publisering. Ved å bruke
        tjenesten aksepterer du vilkårene nedenfor.
      </p>

      <p className="mt-2 text-xs text-[var(--phorium-muted)]">
        Sist oppdatert: 07.03.2026
      </p>

      <div className="mt-6 grid gap-4">
        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">1. Tjenestens formål</h2>
          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Phorium gir en automatisk vurdering basert på en fast standard for
            kontroll av tekst, inkludert presisjon, konsistens, faktagrunnlag
            og publiseringsklar. Tjenesten er ment som støtte før publisering
            og ikke som en fasit.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">2. Brukerens ansvar</h2>
          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Du er selv ansvarlig for innholdet du sender inn og publiserer,
            inkludert at opplysninger er korrekte og at du har nødvendige
            rettigheter til teksten.
          </p>
          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Du forplikter deg til å ikke sende inn innhold som er ulovlig,
            krenkende eller som bryter tredjeparts rettigheter.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">3. Resultat og begrensninger</h2>
          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Resultatet er en automatisk vurdering og innebærer ingen garanti for
            juridisk, faglig eller faktisk riktighet. Phorium kan peke på
            mulige avvik, men kan ikke verifisere alle forhold, alle kilder
            eller alle tolkninger.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">4. Betaling og abonnement</h2>
          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Dersom Phorium tilbyr betalte planer eller abonnement, håndteres
            betaling via Stripe. Ved kjøp aksepterer du også de vilkår og den
            betalingsbehandling som følger av valgt betalingsløsning.
          </p>
          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Eventuelle abonnement løper til de sies opp. Oppsigelse gjelder fra
            neste betalingsperiode, med mindre annet er uttrykkelig oppgitt.
          </p>
          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Phorium forbeholder seg retten til å endre priser fremover. Slike
            endringer vil ikke få tilbakevirkende kraft for allerede betalte
            perioder.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">5. Refusjon</h2>
          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Med mindre annet følger av ufravikelig lovgivning eller er særskilt
            oppgitt, gis det ikke refusjon for allerede påbegynte eller betalte
            abonnementsperioder.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">6. Begrensning av ansvar</h2>
          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Phorium er ikke ansvarlig for direkte eller indirekte tap som følge
            av bruk av tjenesten, inkludert tap knyttet til publisering,
            omdømme, økonomi eller beslutninger basert på resultatet.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">7. Immaterielle rettigheter</h2>
          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Du beholder rettighetene til teksten du sender inn. Phorium beholder
            rettighetene til tjenesten, metodikken, strukturen og presentasjonen
            av kontrollresultatet.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">8. Endringer og tilgjengelighet</h2>
          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Phorium kan endre, oppdatere eller midlertidig stenge tjenesten.
            Dersom innlogging, betaling, lagring av rapporter eller andre
            utvidede funksjoner innføres, vil vilkår og personvern kunne bli
            oppdatert.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">9. Lovvalg</h2>
          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Vilkårene er underlagt norsk rett.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-semibold">Tjenesteleverandør</h2>
          <p className="mt-3 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Phorium er utviklet og driftet av Jensen Digital.
          </p>
          <p className="mt-2 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Organisasjonsnummer: 997509307
          </p>
          <p className="mt-2 text-sm text-[var(--phorium-muted)] leading-relaxed">
            Kontakt:{" "}
            <a
              href="mailto:phorium@jensendigital.no"
              className="text-[var(--phorium-text)] underline underline-offset-4"
            >
              phorium@jensendigital.no
            </a>
          </p>
        </section>
      </div>

      <p className="mt-8 text-xs text-[var(--phorium-muted)]">
        Har du spørsmål om vilkår, personvern eller betaling, kontakt{" "}
        <a
          href="mailto:phorium@jensendigital.no"
          className="text-[var(--phorium-text)] underline underline-offset-4"
        >
          phorium@jensendigital.no
        </a>
        .
      </p>
    </SiteFrame>
  );
}