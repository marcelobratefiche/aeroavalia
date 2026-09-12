"use client";

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-white"
    >
      {/* clear sky */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#eaf6ff] via-[#f7fcff] to-white" />
        {/* soft cloud layers, parallax */}
        <div className="clouds-drift-slow absolute top-[18%] left-1/4 h-14 w-[360px] rounded-full bg-[#0ea5e9]/[0.06] blur-2xl" />
        <div className="clouds-drift absolute top-[38%] left-[60%] h-20 w-[420px] rounded-full bg-[#0ea5e9]/[0.05] blur-2xl" />
        <div className="clouds-drift-slow absolute top-[62%] left-[10%] h-12 w-[300px] rounded-full bg-[#0ea5e9]/[0.05] blur-xl [animation-delay:-10s]" />
      </div>

      {/* flight path: plane climbs, cruises, banks, trailing a contrail */}
      <svg
        viewBox="0 0 760 360"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          d="M -40,220 C 160,40 420,320 760,80"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="contrail-path"
          opacity="0"
        />
      </svg>
      <div className="plane-fly absolute left-0 top-0 text-4xl sm:text-5xl">
        ✈️
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        <p className="font-display text-sm tracking-[0.35em] text-[var(--amber)] uppercase">
          AeroAvalia
        </p>
        <p className="font-mono text-lg sm:text-xl text-[var(--ink)]">
          {message ?? "Preparando seu voo..."}
        </p>

        {/* runway lights, sky-blue */}
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