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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0c1e33]/30 backdrop-blur-sm p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            onClick={(e) => e.stopPropagation()}
            className="card-elevated w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-[var(--line)] bg-white p-7"
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--amber)]">
              Comentário do passageiro
            </p>
            <h2 id="feedback-title" className="font-display text-xl font-semibold mt-1.5 text-[var(--ink)]">
              O que podemos melhorar?
            </h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1.5 leading-relaxed">
              Opcional — conte com seus detalhes o que achou da sua passagem pelo terminal.
            </p>

            <div className="relative mt-5">
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={4000}
                rows={5}
                placeholder="Ex.: A fila de embarque no portão 12 estava demorada..."
                className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] p-3.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none transition-colors focus:border-[var(--amber)] focus:bg-white"
              />
              <span className="absolute bottom-2.5 right-3 font-mono text-[10px] text-[var(--ink-faint)]">
                {text.length}/4000
              </span>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-sm overflow-hidden"
                  style={{ color: "var(--red)" }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-6 flex gap-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="flex-1 rounded-xl border border-[var(--line)] py-3 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:border-[var(--ink-faint)] hover:text-[var(--ink)]"
              >
                Agora não
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={!text.trim() || sending}
                onClick={handleSubmit}
                className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--amber)" }}
              >
                {sending ? "Enviando..." : "Enviar feedback"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
