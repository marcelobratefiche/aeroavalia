"use client";

import { signIn } from "next-auth/react";

export default function EntrarPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] p-8 text-center shadow-xl">
        <p className="font-mono text-xs tracking-[0.35em] text-[var(--amber)] uppercase">
          AeroAvalia
        </p>
        <h1 className="font-display mt-2 text-xl font-semibold">
          Entre para continuar
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Entre com sua conta Google para avaliar sua experiência no aeroporto.
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mt-6 w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-[#1f1f1f] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Entrar com o Google
        </button>
      </div>
    </main>
  );
}
