"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { StarRating } from "@/components/StarRating";
import { FeedbackModal } from "@/components/FeedbackModal";
import { LoadingScreen } from "@/components/LoadingScreen";

type Phase = "rating" | "submitted" | "feedback-sent";

export default function Home() {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(0);
  const [phase, setPhase] = useState<Phase>("rating");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  async function handleSubmitRating() {
    if (rating < 1 || sending) return;
    setSending(true);
    setError(null);
    setShowLoading(true);
    const loadingStarted = Date.now();
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível enviar sua avaliação.");
      setSubmissionId(data.id);
      setPhase("submitted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado. Tente novamente.");
    } finally {
      // keep the loading screen visible for a minimum, tasteful duration
      const elapsed = Date.now() - loadingStarted;
      const remaining = Math.max(0, 900 - elapsed);
      setTimeout(() => setShowLoading(false), remaining);
      setSending(false);
    }
  }

  async function handleSubmitFeedback(text: string) {
    if (!submissionId) return;
    const res = await fetch(`/api/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Não foi possível enviar o feedback.");
    setShowFeedback(false);
    setPhase("feedback-sent");
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12 sm:py-16">
      {showLoading && <LoadingScreen message="Enviando sua avaliação..." />}

      <a
        href="/admin"
        className="fixed right-3 top-3 sm:right-6 sm:top-6 z-10 rounded-full border border-[var(--line)] bg-[var(--bg-panel)]/80 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)] backdrop-blur transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]"
      >
        Avaliações recebidas
      </a>

      <div className="mb-8 text-center">
        <p className="font-mono text-xs tracking-[0.4em] text-[var(--amber)] uppercase">
          Terminal de Passageiros
        </p>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl font-bold">
          Avalie sua experiência
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)] max-w-sm mx-auto">
          Seu feedback ajuda a melhorar cada etapa da sua passagem pelo aeroporto.
        </p>
      </div>

      {status === "loading" && (
        <div className="font-mono text-sm text-[var(--ink-muted)]">Carregando...</div>
      )}

      {status !== "loading" && !session && (
        <SignInCard />
      )}

      {status !== "loading" && session && (
        <BoardingPassCard
          name={session.user?.name ?? "Passageiro"}
          date={today}
          rating={rating}
          setRating={setRating}
          phase={phase}
          error={error}
          sending={sending}
          onSubmitRating={handleSubmitRating}
          onOpenFeedback={() => setShowFeedback(true)}
        />
      )}

      <FeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleSubmitFeedback}
      />

      <footer className="mt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--ink-faint)]">
        AeroAvalia · Sistema de avaliação de passageiros
      </footer>
    </main>
  );
}

function SignInCard() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] p-8 text-center shadow-xl">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--amber)]/10 text-2xl">
        🛫
      </div>
      <h2 className="font-display text-lg font-semibold">Identifique-se para avaliar</h2>
      <p className="mt-2 text-sm text-[var(--ink-muted)]">
        Usamos apenas o nome da sua conta Google para registrar a avaliação. Seu e-mail
        nunca é coletado ou exibido.
      </p>
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="mt-6 w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-[#1f1f1f] transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Entrar com o Google
      </button>
    </div>
  );
}

function BoardingPassCard({
  name,
  date,
  rating,
  setRating,
  phase,
  error,
  sending,
  onSubmitRating,
  onOpenFeedback,
}: {
  name: string;
  date: string;
  rating: number;
  setRating: (v: number) => void;
  phase: Phase;
  error: string | null;
  sending: boolean;
  onSubmitRating: () => void;
  onOpenFeedback: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] shadow-2xl"
    >
      {/* header strip */}
      <div className="flex items-center justify-between border-b border-dashed border-[var(--line)] bg-[var(--bg-panel-raised)] px-6 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--amber)]">
          Cartão de Avaliação
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faint)]">
          {date}
        </p>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--ink-faint)]">
              Passageiro
            </p>
            <p className="font-display text-lg font-semibold truncate max-w-[220px]">
              {name}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--ink-faint)]">
              Status
            </p>
            <p
              className="font-mono text-sm font-semibold"
              style={{ color: phase === "rating" ? "var(--amber)" : "var(--teal)" }}
            >
              {phase === "rating" ? "EM ABERTO" : "CONFIRMADO"}
            </p>
          </div>
        </div>

        <div className="perforation my-6 h-px w-full" />

        <AnimatePresence mode="wait">
          {phase === "rating" && (
            <motion.div
              key="rating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <StarRating value={rating} onChange={setRating} disabled={sending} />

              {error && (
                <p className="text-sm text-center" style={{ color: "var(--red)" }}>
                  {error}
                </p>
              )}

              <AnimatePresence>
                {rating > 0 && (
                  <motion.button
                    key="submit"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    disabled={sending}
                    onClick={onSubmitRating}
                    className="w-full rounded-lg py-3 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    style={{ background: "var(--amber)", color: "#0a0f1e" }}
                  >
                    {sending ? "Enviando..." : "Enviar avaliação"}
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {(phase === "submitted" || phase === "feedback-sent") && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-5 text-center"
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                style={{ background: "rgba(47,217,160,0.12)", color: "var(--teal)" }}
              >
                ✓
              </div>
              <div>
                <p className="font-display font-semibold text-lg">
                  Avaliação enviada com sucesso!
                </p>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  {"★".repeat(rating)}
                  {"☆".repeat(5 - rating)} — obrigado por avaliar sua experiência.
                </p>
              </div>

              {phase === "submitted" ? (
                <button
                  onClick={onOpenFeedback}
                  className="w-full rounded-lg border border-[var(--line)] py-3 text-sm font-semibold text-[var(--ink)] hover:border-[var(--amber)] hover:text-[var(--amber)] transition-colors"
                >
                  Enviar feedback
                </button>
              ) : (
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--teal)]">
                  Feedback registrado — obrigado!
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* barcode-style footer */}
      <div className="flex h-6 w-full items-end gap-[2px] overflow-hidden bg-[var(--bg-panel-raised)] px-6 pb-1.5 opacity-60">
        {Array.from({ length: 48 }).map((_, i) => (
          <span
            key={i}
            style={{ height: `${6 + ((i * 37) % 14)}px` }}
            className="w-[2px] bg-[var(--ink-faint)]"
          />
        ))}
      </div>
    </motion.div>
  );
}
