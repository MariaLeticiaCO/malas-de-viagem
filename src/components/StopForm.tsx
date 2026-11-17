"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Loader2, X } from "lucide-react";
import { STOP_KINDS } from "@/lib/stops";
import type { Stop } from "@/lib/types";

export type StopDraft = Pick<Stop, "title" | "place" | "date" | "time" | "kind" | "notes"> & { id?: string };

type Props = { initial: StopDraft; onCancel: () => void; onSave: (draft: StopDraft) => Promise<void> };

export function StopForm({ initial, onCancel, onSave }: Props) {
  const [draft, setDraft] = useState<StopDraft>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof StopDraft>(k: K, v: StopDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave(draft);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const field = "w-full rounded-xl border-2 border-ink/20 bg-white/70 px-3.5 py-2.5 text-ink outline-none transition focus:border-ink/60";

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-[#0a4a63]/50 backdrop-blur-[2px]" onClick={onCancel} />
      <motion.form
        onSubmit={submit}
        role="dialog"
        aria-modal
        aria-label={initial.id ? "Editar parada" : "Nova parada"}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="parchment relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-[2rem] sm:px-7"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-pirate text-3xl">{initial.id ? "Editar parada" : "Nova parada"}</h2>
          <button type="button" onClick={onCancel} aria-label="Fechar" className="rounded-full p-2 text-ink/70 hover:bg-ink/10">
            <X size={22} />
          </button>
        </div>

        <p className="mt-3 mb-1.5 text-sm font-bold">Que tipo de rolê?</p>
        <div className="grid grid-cols-4 gap-2">
          {STOP_KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => set("kind", k.id)}
              aria-pressed={draft.kind === k.id}
              className={`flex flex-col items-center rounded-xl border-2 py-2 text-xs font-bold transition ${draft.kind === k.id ? "border-ink bg-ink text-parch" : "border-ink/15 bg-white/40"}`}
            >
              <span className="text-xl">{k.emoji}</span>
              {k.label}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm font-bold">
          O que vai rolar?
          <input required autoFocus maxLength={60} value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex.: Almoço no quiosque" className={`${field} mt-1.5`} />
        </label>

        <label className="mt-3 block text-sm font-bold">
          Onde?
          <input maxLength={100} value={draft.place} onChange={(e) => set("place", e.target.value)} placeholder="Ex.: Praia do Forte, Cabo Frio" className={`${field} mt-1.5`} />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block text-sm font-bold">
            Dia
            <input required type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} className={`${field} mt-1.5`} />
          </label>
          <label className="block text-sm font-bold">
            Horário
            <input required type="time" value={draft.time} onChange={(e) => set("time", e.target.value)} className={`${field} mt-1.5`} />
          </label>
        </div>

        <label className="mt-3 block text-sm font-bold">
          Recado (opcional)
          <textarea maxLength={280} rows={2} value={draft.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Levar protetor, reservar mesa…" className={`${field} mt-1.5 resize-none font-hand text-lg`} />
        </label>

        {error && <p className="mt-3 text-sm font-bold text-treasure">{error}</p>}

        <button disabled={busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-treasure py-3.5 font-display text-lg font-semibold text-white shadow-lg shadow-treasure/30 transition active:scale-[0.98] disabled:opacity-60">
          {busy ? <Loader2 className="animate-spin" size={20} /> : initial.id ? "Salvar parada" : "Marcar no mapa"}
        </button>
      </motion.form>
    </motion.div>
  );
}
