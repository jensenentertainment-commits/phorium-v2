import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
      <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(10,18,16,0.34)] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-8">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--phorium-muted)]">
          Betaling fullført
        </div>

        <h1 className="mt-3 text-2xl font-semibold text-[var(--phorium-text)] md:text-3xl">
          Abonnement aktivert
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--phorium-muted)] md:text-base">
          Betalingen er registrert. Phorium åpner nå for videre bruk, og teknisk
          kontroll er inkludert i abonnementet.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm text-[var(--phorium-text)]">
            Du har nå tilgang til:
          </div>

          <div className="mt-3 space-y-2 text-sm text-[var(--phorium-muted)]">
            <div>Ubegrensede analyser</div>
            <div>Full kontrollflyt</div>
            <div>Teknisk kontroll</div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[var(--phorium-accent)] px-5 py-2.5 text-sm font-semibold text-[#11140f] transition hover:brightness-105"
          >
            Tilbake til Phorium
          </Link>

          <Link
            href="/rapport"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm text-[var(--phorium-muted)] transition hover:bg-white/[0.09] hover:text-[var(--phorium-text)]"
          >
            Gå til rapport
          </Link>
        </div>
      </div>
    </main>
  );
}