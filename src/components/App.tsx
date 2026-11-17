"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { AnimatePresence, motion } from "motion/react";
import { Download, Luggage, LogOut, Map } from "lucide-react";
import { fetcher, useSession, type BagsResponse } from "@/lib/client";
import { GENERAL_BAG_COLOR } from "@/lib/constants";
import { GENERAL_BAG_ID } from "@/lib/types";
import { Suitcase } from "./Suitcase";
import { Welcome } from "./Welcome";
import { BagSheet } from "./BagSheet";
import { Roteiro } from "./Roteiro";
import { ScrollIntro } from "./ScrollIntro";

type Tab = "malas" | "roteiro";

export function App() {
  const { user, setUser, ready } = useSession();
  const { data, mutate } = useSWR<BagsResponse>(user ? "/api/bags" : null, fetcher, { refreshInterval: 6000 });
  const [open, setOpen] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("malas");
  const [intro, setIntro] = useState(false);
  const endIntro = useCallback(() => setIntro(false), []);

  // Deep link from the installed app's shortcut: /?aba=roteiro
  useEffect(() => {
    if (new URLSearchParams(location.search).get("aba") === "roteiro") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL on mount
      setTab("roteiro");
    }
  }, []);

  function go(next: Tab) {
    if (next === tab) return;
    setTab(next);
    if (next === "roteiro") setIntro(true);
    history.replaceState(null, "", next === "roteiro" ? "/?aba=roteiro" : "/");
    scrollTo({ top: 0 });
  }

  if (!ready) return null;
  if (!user) return <Welcome onLogin={(bag) => { setUser(bag); setOpen(bag.id); }} />;

  const bags = data?.bags ?? [user];
  const stats = data?.stats ?? {};
  const ownerId = data?.ownerId ?? null;
  const me = bags.find((b) => b.id === user.id) ?? user;
  const ordered = [me, ...bags.filter((b) => b.id !== user.id)];
  const openBag = open === GENERAL_BAG_ID ? null : bags.find((b) => b.id === open);

  const counter = (id: string) => {
    const s = stats[id];
    if (!s || !s.total) return "vazia";
    return s.done === s.total ? "pronta! ✅" : `${s.done}/${s.total} itens`;
  };

  return (
    <>
      <main className="mx-auto w-full max-w-5xl px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-32 sm:px-6">
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-coral">Olá, {me.name}! ☀️</p>
            <h1 className="font-display text-[1.75rem] leading-tight font-bold whitespace-nowrap text-slate-800 sm:text-4xl">{tab === "malas" ? "Nossas malas" : "Roteiro"}</h1>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/instalar" className="hide-standalone inline-flex items-center gap-1.5 rounded-full bg-coral px-3.5 py-2 text-sm font-bold text-white shadow-sm shadow-coral/30 transition active:scale-95">
              <Download size={16} /> <span className="max-[380px]:hidden">Baixar app</span>
            </Link>
            <button onClick={() => { setUser(null); setOpen(null); }} aria-label="Sair" className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-orange-900/5 transition hover:text-slate-900">
              <LogOut size={16} /> <span className="max-sm:hidden">Sair</span>
            </button>
          </div>
        </header>

        {tab === "malas" ? (
          <>
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

            <h2 className="mt-10 mb-6 font-display text-xl font-semibold text-slate-700">
              Quem vai viajar <span className="text-slate-400">· {bags.length}</span>
            </h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {ordered.map((b, i) => (
                <motion.li key={b.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <motion.button whileHover={{ y: -6, rotate: -1.5 }} whileTap={{ scale: 0.96 }} onClick={() => setOpen(b.id)} className="group w-full text-center">
                    <Suitcase color={b.color} name={b.name} crown={b.id === ownerId} className="mx-auto w-[82%]" />
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      {b.id === user.id ? <span className="text-coral">Minha mala · </span> : null}
                      {counter(b.id)}
                    </p>
                    {b.id === ownerId && <p className="text-xs font-bold text-amber-600">👑 dono do rolê</p>}
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          </>
        ) : (
          !intro && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}>
              <Roteiro user={me} bags={bags} onOwnerChange={() => mutate()} />
            </motion.div>
          )
        )}
      </main>

      <TabBar tab={tab} onChange={go} />

      <AnimatePresence>{intro && <ScrollIntro key="intro" onDone={endIntro} />}</AnimatePresence>

      <AnimatePresence>
        {open === GENERAL_BAG_ID && (
          <BagSheet key="geral" bagId={GENERAL_BAG_ID} title="Mala geral" color={GENERAL_BAG_COLOR} editable user={me} onClose={() => setOpen(null)} onChange={() => mutate()} />
        )}
        {openBag && (
          <BagSheet key={openBag.id} bagId={openBag.id} title={openBag.id === user.id ? "Minha mala" : `Mala de ${openBag.name}`} color={openBag.color} editable={openBag.id === user.id} user={me} onClose={() => setOpen(null)} onChange={() => mutate()} />
        )}
      </AnimatePresence>
    </>
  );
}

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const items = [
    { id: "malas" as const, label: "Malas", Icon: Luggage },
    { id: "roteiro" as const, label: "Roteiro", Icon: Map },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))]" aria-label="Abas">
      <div className="flex gap-1 rounded-full bg-white/90 p-1.5 shadow-xl shadow-orange-900/15 ring-1 ring-orange-900/10 backdrop-blur">
        {items.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-current={tab === id ? "page" : undefined}
            className={`relative flex items-center gap-2 rounded-full px-6 py-3 font-display font-semibold transition-colors ${tab === id ? "text-white" : "text-slate-500 hover:text-slate-800"}`}
          >
            {tab === id && (
              <motion.span layoutId="tab-pill" className={`absolute inset-0 rounded-full ${id === "roteiro" ? "bg-ink" : "bg-coral"}`} transition={{ type: "spring", stiffness: 420, damping: 34 }} />
            )}
            <Icon size={20} className="relative" />
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
