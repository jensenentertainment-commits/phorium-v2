"use client";

import React from "react";

type AccessState = {
  email: string;
  displayName: string | null;
  freeRunsUsed: number;
  subscriptionStatus: "inactive" | "active" | "past_due" | "canceled";
  accessTier: "default" | "vip";
  canRun: boolean;
  canUseTechnical: boolean;
};

const EMAIL_STORAGE_KEY = "phorium:email";

function Panel({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(10,18,16,0.34)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-6">
      {(eyebrow || title || subtitle) && (
        <div>
          {eyebrow ? (
            <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--phorium-muted)]">
              {eyebrow}
            </div>
          ) : null}

          {title ? (
            <div className="mt-2 text-lg font-semibold text-[var(--phorium-text)]">
              {title}
            </div>
          ) : null}

          {subtitle ? (
            <div className="mt-2 text-sm leading-relaxed text-[var(--phorium-muted)]">
              {subtitle}
            </div>
          ) : null}
        </div>
      )}

      <div className={eyebrow || title || subtitle ? "mt-5" : ""}>{children}</div>
    </div>
  );
}

function statusLabel(access: AccessState | null) {
  if (!access) return "Ukjent";
  if (access.accessTier === "vip") return "VIP";
  if (access.subscriptionStatus === "active") return "Aktivt abonnement";
  if (access.subscriptionStatus === "past_due") return "Betaling forfalt";
  if (access.subscriptionStatus === "canceled") return "Avsluttet";
  return "Gratisnivå";
}

export default function MinSidePage() {
  const [email, setEmail] = React.useState("");
  const [access, setAccess] = React.useState<AccessState | null>(null);
  const [displayName, setDisplayName] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [portalLoading, setPortalLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const savedEmail =
      typeof window !== "undefined"
        ? window.localStorage.getItem(EMAIL_STORAGE_KEY) ?? ""
        : "";

    if (!savedEmail) {
      setLoading(false);
      return;
    }

    setEmail(savedEmail);

    fetch("/api/account", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: savedEmail }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Kunne ikke hente kontodata.");
        setAccess(data);
        setDisplayName(data.displayName ?? "");
      })
      .catch((e: any) => {
        setMessage(e?.message || "Kunne ikke hente kontodata.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function saveProfile() {
    if (!email) return;

    try {
      setSaving(true);
      setMessage("");

      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          displayName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Kunne ikke lagre profil.");

      setAccess(data);
      setDisplayName(data.displayName ?? "");
      setMessage("Visningsnavn lagret.");
    } catch (e: any) {
      setMessage(e?.message || "Kunne ikke lagre profil.");
    } finally {
      setSaving(false);
    }
  }

  async function openCustomerPortal() {
    if (!email) return;

    try {
      setPortalLoading(true);
      setMessage("");

      const res = await fetch("/api/stripe/customer-portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Kunne ikke åpne abonnementssiden.");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setMessage(e?.message || "Kunne ikke åpne abonnementssiden.");
      setPortalLoading(false);
    }
  }

  function clearUser() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(EMAIL_STORAGE_KEY);
      window.location.href = "/";
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
      <header className="mb-8">
        <div className="text-xs tracking-[0.22em] uppercase text-[var(--phorium-muted)]">
          Konto
        </div>

        <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-[var(--phorium-text)]">
          Min side
        </h1>

        <p className="mt-3 max-w-2xl text-sm md:text-base text-[var(--phorium-muted)] leading-relaxed">
          Kontoopplysninger, tilgangsnivå og abonnementshåndtering for Phorium.
        </p>
      </header>

      {!email && !loading ? (
        <Panel
          eyebrow="Ingen bruker valgt"
          title="Ingen e-post er registrert i denne nettleseren"
          subtitle="Åpne Phorium og kjør en analyse for å knytte denne nettleseren til en konto."
        >
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[var(--phorium-accent)] px-5 py-2.5 text-sm font-semibold text-[#11140f] transition hover:brightness-105"
          >
            Tilbake til Phorium
          </a>
        </Panel>
      ) : null}

      {email ? (
        <div className="grid gap-5 md:grid-cols-2">
          <Panel eyebrow="Profil" title="Kontoopplysninger">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-[var(--phorium-muted)]">E-post</div>
                <div className="mt-1 text-sm text-[var(--phorium-text)]">{email}</div>
              </div>

              <div>
                <label className="text-xs text-[var(--phorium-muted)]">
                  Visningsnavn
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Skriv inn visningsnavn"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-[var(--phorium-text)] outline-none placeholder:text-[var(--phorium-muted)] focus:border-white/20 focus:ring-2 focus:ring-[var(--phorium-accent)]/20"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving || loading}
                  className="inline-flex items-center justify-center rounded-full bg-[var(--phorium-accent)] px-5 py-2.5 text-sm font-semibold text-[#11140f] transition hover:brightness-105 disabled:opacity-50"
                >
                  {saving ? "Lagrer…" : "Lagre navn"}
                </button>

                <button
                  type="button"
                  onClick={clearUser}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-[var(--phorium-muted)] transition hover:bg-white/[0.09] hover:text-[var(--phorium-text)]"
                >
                  Bytt bruker
                </button>
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Tilgang" title="Abonnement og tilgang">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-[var(--phorium-muted)]">Status</div>
                <div className="mt-1 text-sm text-[var(--phorium-text)]">
                  {loading ? "Laster…" : statusLabel(access)}
                </div>
              </div>

              <div>
                <div className="text-xs text-[var(--phorium-muted)]">Plan</div>
                <div className="mt-1 text-sm text-[var(--phorium-text)]">
                  Phorium · 249 kr / måned
                </div>
              </div>

              <div>
                <div className="text-xs text-[var(--phorium-muted)]">
                  Teknisk kontroll
                </div>
                <div className="mt-1 text-sm text-[var(--phorium-text)]">
                  {access?.canUseTechnical ? "Aktiv" : "Ikke inkludert"}
                </div>
              </div>

              <div>
                <div className="text-xs text-[var(--phorium-muted)]">
                  Gratis analyser brukt
                </div>
                <div className="mt-1 text-sm text-[var(--phorium-text)]">
                  {access?.freeRunsUsed ?? 0} / 3
                </div>
              </div>

              <button
                type="button"
                onClick={openCustomerPortal}
                disabled={
                  portalLoading ||
                  loading ||
                  !access ||
                  (!access.canUseTechnical && access.accessTier !== "vip")
                }
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm text-[var(--phorium-muted)] transition hover:bg-white/[0.09] hover:text-[var(--phorium-text)] disabled:opacity-50"
              >
                {portalLoading ? "Åpner…" : "Administrer abonnement"}
              </button>
            </div>
          </Panel>
        </div>
      ) : null}

      {message ? (
        <div className="mt-5 text-sm text-[var(--phorium-muted)]">{message}</div>
      ) : null}
    </main>
  );
}