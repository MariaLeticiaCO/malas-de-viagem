"use client";
import { useState } from "react";
import useSWR from "swr";
import { AnimatePresence, motion } from "motion/react";
import { LogOut } from "lucide-react";
import { fetcher, useSession, type BagsResponse } from "@/lib/client";
import { GENERAL_BAG_COLOR } from "@/lib/constants";
import { GENERAL_BAG_ID } from "@/lib/types";
import { Suitcase } from "./Suitcase";
import { Welcome } from "./Welcome";
import { BagSheet } from "./BagSheet";

export function App() {
  const { user, setUser, ready } = useSession();
  const { data, mutate } = useSWR<BagsResponse>(user ? "/api/bags" : null, fetcher, { refreshInterval: 6000 });
  const [open, setOpen] = useState<string | null>(null);

  if (!ready) return null;
  if (!user) return <Welcome onLogin={(bag) => { setUser(bag); setOpen(bag.id); }} />;

  const bags = data?.bags ?? [user];
  const stats = data?.stats ?? {};
  const me = bags.find((b) => b.id === user.id) ?? user;
  const others = bags.filter((b) => b.id !== user.id);
  const ordered = [me, ...others];
  const openBag = open === GENERAL_BAG_ID ? null : bags.find((b) => b.id === open);

  const counter = (id: string) => {
    const s = stats[id];
    if (!s || !s.total) return "vazia";
    return s.done === s.total ? "pronta! ✅" : `${s.done}/${s.total} itens`;
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-16 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-coral">Olá, {me.name}! ☀️</p>
          <h1 className="font-display text-3xl font-bold text-slate-800 sm:text-4xl">Nossas malas</h1>
        </div>
        <button onClick={() => { setUser(null); setOpen(null); }} className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-orange-900/5 transition hover:text-slate-900">
          <LogOut size={16} /> Sair
        </button>
      </header>

      <motion.button
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(GENERAL_BAG_ID)}
        className="mt-6 flex w-full items-center gap-4 rounded-[2rem] bg-gradient-to-br from-teal-400/90 to-sky-500/90 p-4 text-left text-white shadow-lg shadow-sky-700/15 sm:gap-6 sm:p-6"
      >
        <div className="w-24 shrink-0 sm:w-32">
          <Suitcase color={GENERAL_BAG_COLOR} name="Geral" general />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Mala geral</h2>
          <p className="mt-1 text-white/90">O que todo mundo precisa. Qualquer pessoa pode adicionar e marcar.</p>
          <span className="mt-3 inline-block rounded-full bg-white/25 px-3 py-1 text-sm font-bold">{counter(GENERAL_BAG_ID)}</span>
        </div>
      </motion.button>

      <h2 className="mt-10 mb-4 font-display text-xl font-semibold text-slate-700">Quem vai viajar <span className="text-slate-400">· {bags.length}</span></h2>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {ordered.map((b, i) => (
          <motion.li key={b.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <motion.button whileHover={{ y: -6, rotate: -1.5 }} whileTap={{ scale: 0.96 }} onClick={() => setOpen(b.id)} className="group w-full text-center">
              <Suitcase color={b.color} name={b.name} className="mx-auto w-[82%]" />
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {b.id === user.id ? <span className="text-coral">Minha mala · </span> : null}
                {counter(b.id)}
              </p>
            </motion.button>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {open === GENERAL_BAG_ID && (
          <BagSheet key="geral" bagId={GENERAL_BAG_ID} title="Mala geral" color={GENERAL_BAG_COLOR} editable user={me} onClose={() => setOpen(null)} onChange={() => mutate()} />
        )}
        {openBag && (
          <BagSheet key={openBag.id} bagId={openBag.id} title={openBag.id === user.id ? "Minha mala" : `Mala de ${openBag.name}`} color={openBag.color} editable={openBag.id === user.id} user={me} onClose={() => setOpen(null)} onChange={() => mutate()} />
        )}
      </AnimatePresence>
    </main>
  );
}
