"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Account = {
  email: string;
  displayName: string | null;
};

const EMAIL_STORAGE_KEY = "phorium:email";

export function AccountChip() {
  const [account, setAccount] = useState<Account | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const email =
      typeof window !== "undefined"
        ? window.localStorage.getItem(EMAIL_STORAGE_KEY)
        : null;

    if (!email) return;

    fetch("/api/account", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) return;

        setAccount({
          email: data.email,
          displayName: data.displayName ?? null,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const label =
    account?.displayName?.trim() ||
    account?.email ||
    "Min side";

  const initial =
    account?.displayName?.trim()?.charAt(0).toUpperCase() ||
    account?.email?.charAt(0).toUpperCase() ||
    "M";

  function logout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(EMAIL_STORAGE_KEY);
      window.location.href = "/";
    }
  }

  return (
    <div ref={rootRef} className="relative z-[80]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex max-w-[220px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[var(--phorium-text)] transition hover:bg-white/[0.08]"
        title={account?.email ?? "Min side"}
      >
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[10px]">
          {initial}
        </span>

        <span className="truncate">{label}</span>

        <span
          className={[
            "text-[10px] opacity-60 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-[90] mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(10,18,16,0.96)] shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          role="menu"
        >
          <div className="border-b border-white/8 px-4 py-3">
            <div className="truncate text-sm font-semibold text-[var(--phorium-text)]">
              {account?.displayName?.trim() || "Min side"}
            </div>
            <div className="mt-1 truncate text-xs text-[var(--phorium-muted)]">
              {account?.email ?? "Ingen e-post registrert"}
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/min-side"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-[var(--phorium-text)] transition hover:bg-white/[0.06]"
              role="menuitem"
            >
              Min side
            </Link>

            <Link
              href="/min-side"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-[var(--phorium-text)] transition hover:bg-white/[0.06]"
              role="menuitem"
            >
              Administrer abonnement
            </Link>

            <button
              type="button"
              onClick={logout}
              className="block w-full px-4 py-2.5 text-left text-sm text-[var(--phorium-muted)] transition hover:bg-white/[0.06] hover:text-[var(--phorium-text)]"
              role="menuitem"
            >
              Logg ut
            </button>
          </div>
        </div>
      )}
    </div>
  );
}