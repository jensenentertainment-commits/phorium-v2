import Link from "next/link";

const NAV = [
  { href: "/review", label: "Start vurdering" },
  { href: "/standard", label: "Standard" },
  { href: "/privacy", label: "Personvern" },
  { href: "/terms", label: "Vilkår" },
];

export function SiteFrame({
  children,
  max = "max-w-5xl",
}: {
  children: React.ReactNode;
  max?: string;
}) {
  return (
    <main className="min-h-screen bg-[var(--phorium-bg)] text-[var(--phorium-text)]">
      <div className={`mx-auto w-full ${max} px-4 py-10 md:py-14`}>
     

        <div className="mt-10">{children}</div>

     
      </div>
    </main>
  );
}
