"use client";

import { useState } from "react";
import clsx from "clsx";

const LABELS: Record<number, string> = {
  1: "Muito ruim",
  2: "Ruim",
  3: "Regular",
  4: "Boa",
  5: "Excelente",
};

export function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="radiogroup"
        aria-label="Nota da experiência, de 1 a 5 estrelas"
        className="flex gap-1.5 sm:gap-2"
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= shown;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} estrela${n > 1 ? "s" : ""} — ${LABELS[n]}`}
              disabled={disabled}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(null)}
              onClick={() => onChange(n)}
              className={clsx(
                "group relative text-4xl sm:text-5xl leading-none transition-transform duration-150 ease-out",
                "disabled:cursor-not-allowed disabled:opacity-50",
                active ? "scale-110" : "scale-100 hover:scale-105"
              )}
              style={{
                color: active ? "var(--amber)" : "var(--ink-faint)",
                filter: active ? "drop-shadow(0 0 10px rgba(255,182,39,0.45))" : "none",
                transition:
                  "color 150ms ease, transform 150ms ease, filter 150ms ease",
              }}
            >
              {active ? "★" : "☆"}
            </button>
          );
        })}
      </div>
      <p
        className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] transition-opacity duration-150"
        style={{ color: shown ? "var(--amber)" : "var(--ink-faint)" }}
      >
        {shown ? LABELS[shown] : "Toque em uma estrela"}
      </p>
    </div>
  );
}
