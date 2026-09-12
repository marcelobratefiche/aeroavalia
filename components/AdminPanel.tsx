"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { LoadingScreen } from "@/components/LoadingScreen";

type Summary = {
  id: string;
  displayName: string;
  rating: number;
  createdAt: string;
  hasFeedback: boolean;
};

type Detail = {
  id: string;
  displayName: string;
  rating: number;
  feedback: string | null;
  createdAt: string;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminPanel({ adminName }: { adminName: string }) {
  const [items, setItems] = useState<Summary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [firstLoadScreen, setFirstLoadScreen] = useState(false);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    const started = Date.now();
    setFirstLoadScreen(true);
    try {
      const res = await fetch("/api/submissions?take=20");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao carregar avaliações.");
      setItems(data.items);
      setCursor(data.nextCursor);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar avaliações.");
    } finally {
      const elapsed = Date.now() - started;
      setTimeout(() => setFirstLoadScreen(false), Math.max(0, 700 - elapsed));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    loadFirstPage();
  }, [loadFirstPage]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/submissions?take=20&cursor=${cursor}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao carregar mais avaliações.");
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar mais avaliações.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function openDetail(id: string) {
    setDetailLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/submissions/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao carregar avaliação.");
      setSelected(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar avaliação.");
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <main className="min-h-dvh px-4 py-10 sm:py-14">
      <AnimatePresence>
        {firstLoadScreen && <LoadingScreen message="Consultando o painel de chegadas..." />}
      </AnimatePresence>

      <div className="mx-auto max-w-2xl">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <p className="font-mono text-xs tracking-[0.35em] text-[var(--amber)] uppercase">
              Painel administrativo
            </p>
            <h1 className="font-display mt-1.5 text-2xl font-bold text-[var(--ink)]">
              Avaliações recebidas
            </h1>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              {adminName} · {total !== null ? `${total} avaliações no total` : "\u00A0"}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faint)] transition-colors hover:text-[var(--ink)]"
          >
            Sair
          </button>
        </motion.header>

        <div className="card-elevated rounded-2xl border border-[var(--line)] bg-white p-2 sm:p-3">
          <div className="mb-1 grid grid-cols-[1fr_auto_auto] gap-4 border-b border-[var(--line)] px-4 pb-3 pt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faint)]">
            <span>Passageiro</span>
            <span>Nota</span>
            <span className="hidden sm:block">Data</span>
          </div>

          {loading && !firstLoadScreen && (
            <div className="py-12 text-center font-mono text-sm text-[var(--ink-muted)]">
              Carregando...
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm" style={{ color: "var(--red)" }}>
                {error}
              </p>
              <button
                onClick={loadFirstPage}
                className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]"
              >
                Tente novamente
              </button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">🛬</p>
              <p className="font-display font-semibold text-[var(--ink)]">
                Nenhuma avaliação encontrada
              </p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                Assim que os passageiros avaliarem, elas aparecem aqui.
              </p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <ul className="divide-y divide-[var(--line)]">
              {items.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 10) * 0.035, duration: 0.25 }}
                >
                  <button
                    onClick={() => openDetail(s.id)}
                    className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 rounded-xl px-4 py-4 text-left transition-colors hover:bg-[var(--bg-panel)]"
                  >
                    <span className="truncate font-medium text-[var(--ink)]">
                      {s.displayName}
                      {s.hasFeedback && (
                        <span
                          className="ml-2 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide"
                          style={{ background: "rgba(22,163,74,0.1)", color: "var(--teal)" }}
                        >
                          feedback
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-sm" style={{ color: "var(--amber)" }}>
                      {"★".repeat(s.rating)}
                      <span style={{ color: "var(--ink-faint)" }}>
                        {"★".repeat(5 - s.rating)}
                      </span>
                    </span>
                    <span className="hidden sm:block font-mono text-xs text-[var(--ink-faint)]">
                      {formatDateTime(s.createdAt)}
                    </span>
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        {!loading && cursor && (
          <div className="mt-6 flex justify-center">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-xl border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)] disabled:opacity-50"
            >
              {loadingMore ? "Carregando..." : "Carregar mais"}
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {(detailLoading || selected) && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0c1e33]/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="card-elevated w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-[var(--line)] bg-white p-7"
              initial={{ y: 48, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 32, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", damping: 28, stiffness: 340 }}
            >
              {detailLoading && (
                <div className="py-12 text-center font-mono text-sm text-[var(--ink-muted)]">
                  Carregando...
                </div>
              )}
              {selected && !detailLoading && (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--amber)]">
                        Detalhe da avaliação
                      </p>
                      <h2 className="font-display text-xl font-semibold mt-1.5 text-[var(--ink)]">
                        {selected.displayName}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      aria-label="Fechar"
                      className="text-[var(--ink-faint)] hover:text-[var(--ink)] text-xl leading-none transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  <p className="mt-3.5 font-mono text-lg" style={{ color: "var(--amber)" }}>
                    {"★".repeat(selected.rating)}
                    <span style={{ color: "var(--ink-faint)" }}>
                      {"★".repeat(5 - selected.rating)}
                    </span>
                  </p>

                  <p className="mt-1 font-mono text-xs text-[var(--ink-faint)]">
                    Enviado em {formatDateTime(selected.createdAt)}
                  </p>

                  <div className="perforation my-5 h-px w-full" />

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--ink-faint)] mb-1.5">
                      Feedback
                    </p>
                    {selected.feedback ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--ink)]">
                        {selected.feedback}
                      </p>
                    ) : (
                      <p className="text-sm text-[var(--ink-muted)] italic">
                        O passageiro não deixou um comentário escrito.
                      </p>
                    )}
                  </div>

                  <p className="mt-6 font-mono text-[10px] text-[var(--ink-faint)] break-all">
                    ID: {selected.id}
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
