"use client";

type Status = "none" | "running" | "ok" | "bad";

export function ControlRunIndicator({
  activeIndex,
  statuses,
}: {
  activeIndex: number; // 0..3, eller -1 når idle
  statuses: Status[];  // lengde 4
}) {
  const steps = ["Presisjon", "Konsistens", "Faktagrunnlag", "Publiseringsklar"];

  const chipClass = (s: Status, isActive: boolean) => {
    if (s === "ok")
      return "border-[color:var(--phorium-ok)] bg-[var(--phorium-ok-bg)] text-[color:var(--phorium-ok)]";
    if (s === "bad")
      return "border-[color:var(--phorium-bad)] bg-[var(--phorium-bad-bg)] text-[color:var(--phorium-bad)]";
    if (isActive)
      return "border-white/20 bg-white/10 text-[var(--phorium-text)]";
    return "border-white/10 bg-white/5 text-[var(--phorium-muted)]";
  };

  const dotClass = (s: Status, isActive: boolean) => {
    if (s === "ok") return "bg-[color:var(--phorium-ok)]";
    if (s === "bad") return "bg-[color:var(--phorium-bad)]";
    if (isActive) return "bg-[var(--phorium-accent)]";
    return "bg-white/20";
  };

  const labelFor = (s: Status, isActive: boolean) => {
    if (s === "ok") return "OK";
    if (s === "bad") return "Avvik";
    if (isActive) return "Kjører…";
    return "—";
  };

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      {/* progress bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5">
        {/* subtle moving scan line only while running */}
        {activeIndex >= 0 && activeIndex <= 3 && (
          <div
            className="absolute inset-y-0 w-1/3 animate-[phorium-scan_1.1s_linear_infinite] rounded-full bg-[var(--phorium-accent)]/30"
            style={{ left: `${activeIndex * 25}%` }}
          />
        )}
        <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />
      </div>

      {/* chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {steps.map((name, idx) => {
          const s = statuses[idx] ?? "none";
          const isActive = idx === activeIndex && s === "running";
          return (
            <span
              key={name}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
                chipClass(s, isActive),
              ].join(" ")}
            >
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  dotClass(s, isActive),
                  isActive ? "animate-pulse" : "",
                ].join(" ")}
              />
              <span className="font-semibold">{name}</span>
              <span className="opacity-80">{labelFor(s, isActive)}</span>
            </span>
          );
        })}
      </div>

      {/* keyframes */}
      <style jsx>{`
        @keyframes phorium-scan {
          0% { transform: translateX(-30%); opacity: 0.4; }
          50% { opacity: 0.8; }
          100% { transform: translateX(60%); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}