"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { BAG_COLORS } from "@/lib/constants";
import { api } from "@/lib/client";
import type { Bag } from "@/lib/types";
import { Suitcase } from "./Suitcase";

export function Welcome({ onLogin }: { onLogin: (bag: Bag) => void }) {
  const [name, setName] = useState("");
  const [step, setStep] = useState<"name" | "color">("name");
  const [color, setColor] = useState<string>(BAG_COLORS[0].value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (step === "name") {
        const res = await api<{ bag: Bag | null }>("/api/bags", "POST", null, { name });
        if (res.bag) onLogin(res.bag);
        else setStep("color");
      } else {
        const res = await api<{ bag: Bag }>("/api/bags", "POST", null, { name, color });
        onLogin(res.bag);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <form onSubmit={submit} className="rounded-[2rem] bg-white/80 p-6 shadow-xl shadow-orange-900/5 ring-1 ring-orange-900/5 backdrop-blur sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {step === "name" ? (
            <motion.div key="name" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-2 text-5xl">🧳☀️</div>
              <h1 className="font-display text-3xl font-bold text-slate-800">Quem vai viajar?</h1>
              <p className="mt-1 text-slate-600">Digite seu nome. Se você já tem uma mala, entra direto nela.</p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                placeholder="Seu nome"
                autoComplete="given-name"
                className="mt-6 w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3.5 text-lg outline-none transition focus:border-coral"
              />
            </motion.div>
          ) : (
            <motion.div key="color" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <button type="button" onClick={() => setStep("name")} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800">
                <ArrowLeft size={16} /> Voltar
              </button>
              <h1 className="font-display text-3xl font-bold text-slate-800">Escolha sua mala</h1>
              <p className="mt-1 text-slate-600">Qual cor combina com você, {name.trim()}?</p>
              <motion.div key={color} initial={{ scale: 0.92, rotate: -3 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 14 }} className="mx-auto mt-4 w-40">
                <Suitcase color={color} name={name.trim()} />
              </motion.div>
              <div className="mt-5 grid grid-cols-5 gap-3" role="radiogroup" aria-label="Cor da mala">
                {BAG_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={color === c.value}
                    aria-label={c.name}
                    title={c.name}
                    onClick={() => setColor(c.value)}
                    className={`aspect-square rounded-full transition ${color === c.value ? "scale-110 ring-4 ring-slate-800/80 ring-offset-2" : "hover:scale-105"}`}
                    style={{ background: c.value }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

        <button
          disabled={busy || !name.trim()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-coral px-5 py-3.5 font-display text-lg font-semibold text-white shadow-lg shadow-coral/30 transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? <Loader2 className="animate-spin" size={20} /> : step === "name" ? <>Entrar <ArrowRight size={20} /></> : "Salvar minha mala"}
        </button>
      </form>
    </main>
  );
}
