"use client";

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-terminal)]"
    >
      {/* sky */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-[#0d1530] to-[#0a0f1e]" />
        {/* stars */}
        <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(1px_1px_at_20%_30%,#fff,transparent),radial-gradient(1px_1px_at_60%_15%,#fff,transparent),radial-gradient(1px_1px_at_80%_45%,#fff,transparent),radial-gradient(1.5px_1.5px_at_35%_60%,#fff,transparent),radial-gradient(1px_1px_at_90%_70%,#fff,transparent)]" />
        {/* clouds */}
        <div className="clouds-drift absolute top-[30%] left-1/2 h-16 w-[420px] rounded-full bg-white/[0.04] blur-xl" />
        <div className="clouds-drift absolute top-[55%] left-1/3 h-12 w-[300px] rounded-full bg-white/[0.03] blur-lg [animation-delay:-6s]" />
      </div>

      {/* plane */}
      <div className="plane-fly absolute left-0 top-1/3 text-4xl sm:text-5xl">
        ✈️
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        <p className="font-display text-sm tracking-[0.35em] text-[var(--amber)] uppercase">
          AeroAvalia
        </p>
        <p className="font-mono text-lg sm:text-xl text-[var(--ink)]">
          {message ?? "Preparando seu voo..."}
        </p>

        {/* runway */}
        <div className="mt-2 flex items-center gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className="runway-light h-1.5 w-1.5 rounded-full bg-[var(--amber)]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
