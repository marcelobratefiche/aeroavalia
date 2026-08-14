"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FeedbackModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    try {
      await onSubmit(text.trim());
      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível enviar. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] p-6 shadow-2xl"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--amber)]">
              Comentário do passageiro
            </p>
            <h2 id="feedback-title" className="font-display text-xl font-semibold mt-1">
              O que podemos melhorar?
            </h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">
              Opcional — conte com seus detalhes o que achou da sua passagem pelo terminal.
            </p>

            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={4000}
              rows={5}
              placeholder="Ex.: A fila de embarque no portão 12 estava demorada..."
              className="mt-4 w-full resize-none rounded-lg border border-[var(--line)] bg-[var(--bg-terminal)] p-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none focus:border-[var(--amber)] transition-colors"
            />

            {error && (
              <p className="mt-2 text-sm" style={{ color: "var(--red)" }}>
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-[var(--line)] py-2.5 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--ink-faint)] transition-colors"
              >
                Agora não
              </button>
              <button
                type="button"
                disabled={!text.trim() || sending}
                onClick={handleSubmit}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--amber)", color: "#0a0f1e" }}
              >
                {sending ? "Enviando..." : "Enviar feedback"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
