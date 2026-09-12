"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
    <div className="flex flex-col items-center gap-4">
      <div
        role="radiogroup"
        aria-label="Nota da experiência, de 1 a 5 estrelas"
        className="flex gap-2 sm:gap-2.5"
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= shown;
          const justSelected = n <= value && n === value;
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
              className="group relative disabled:cursor-not-allowed disabled:opacity-40"
            >
              {active && justSelected && (
                <span
                  className="glow-pulse absolute inset-0 rounded-full blur-md"
                  style={{ background: "var(--amber)" }}
                  aria-hidden="true"
                />
              )}
              <motion.span
                className="relative block text-4xl sm:text-5xl leading-none"
                animate={{
                  scale: active ? 1.12 : 1,
                  color: active ? "var(--amber)" : "var(--ink-faint)",
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
              >
                {active ? "★" : "☆"}
              </motion.span>
            </button>
          );
        })}
      </div>
      <motion.p
        key={shown}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className={clsx(
          "font-mono text-xs sm:text-sm uppercase tracking-[0.25em]"
        )}
        style={{ color: shown ? "var(--amber)" : "var(--ink-faint)" }}
      >
        {shown ? LABELS[shown] : "Toque em uma estrela"}
      </motion.p>
    </div>
  );
}
