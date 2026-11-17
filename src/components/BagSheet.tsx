"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { AnimatePresence, motion } from "motion/react";
import { Check, Lock, Plus, Trash2, X } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { api, fetcher, type ItemsResponse } from "@/lib/client";
import type { Bag, CategoryId, Item } from "@/lib/types";

const now = () => Date.now();

type Props = {
  bagId: string;
  title: string;
  color: string;
  editable: boolean;
  user: Bag;
  onClose: () => void;
  onChange: () => void;
};

export function BagSheet({ bagId, title, color, editable, user, onClose, onChange }: Props) {
  const key = `/api/bags/${bagId}/items`;
  const { data, mutate, isLoading } = useSWR<ItemsResponse>(key, fetcher, { refreshInterval: 4000 });
  const items = useMemo(() => data?.items ?? [], [data]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<CategoryId>("roupas");
  const [error, setError] = useState("");

  const done = items.filter((i) => i.checked).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  async function run(optimistic: Item[], action: () => Promise<unknown>) {
    setError("");
    try {
      await mutate(async () => {
        await action();
        return fetcher(key);
      }, { optimisticData: { items: optimistic }, rollbackOnError: true, revalidate: false });
      onChange();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function add(itemText: string, cat: CategoryId) {
    const t = itemText.trim();
    if (!t) return;
    const temp: Item = { id: `tmp-${crypto.randomUUID()}`, text: t, category: cat, checked: false, addedBy: user.name, createdAt: now() };
    run([...items, temp], () => api(key, "POST", user, { text: t, category: cat }));
  }

  const toggle = (it: Item) =>
    run(items.map((i) => (i.id === it.id ? { ...i, checked: !i.checked } : i)), () =>
      api(`${key}/${it.id}`, "PATCH", user, { checked: !it.checked }),
    );

  const remove = (it: Item) =>
    run(items.filter((i) => i.id !== it.id), () => api(`${key}/${it.id}`, "DELETE", user));

  const existing = new Set(items.map((i) => i.text.toLowerCase()));
  const suggestions = (CATEGORIES.find((c) => c.id === category)?.suggestions ?? []).filter(
    (s) => !existing.has(s.toLowerCase()),
  );

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <motion.section
        role="dialog"
        aria-modal
        aria-label={title}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[2rem] bg-cream shadow-2xl sm:rounded-[2rem]"
      >
        <header className="px-5 pt-5 pb-4 text-white sm:px-6" style={{ background: `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color} 70%, #ffb347))` }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold opacity-90">{editable ? "Sua lista" : "Só visualização"}</p>
              <h2 className="truncate font-display text-2xl font-bold">{title}</h2>
            </div>
            <button onClick={onClose} aria-label="Fechar" className="rounded-full bg-white/25 p-2 transition hover:bg-white/40">
              <X size={20} />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <motion.div className="h-full rounded-full bg-white" animate={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-bold tabular-nums">{done}/{items.length}</span>
          </div>
        </header>

        {editable ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              add(text, category);
              setText("");
            }}
            className="border-b border-orange-900/10 bg-white/70 px-5 py-4 sm:px-6"
          >
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${category === c.id ? "bg-slate-800 text-white" : "bg-orange-50 text-slate-700 hover:bg-orange-100"}`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
            <div className="mt-1 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={80}
                placeholder="Adicionar item…"
                className="min-w-0 flex-1 rounded-xl border-2 border-orange-100 bg-white px-3.5 py-2.5 outline-none focus:border-coral"
              />
              <button disabled={!text.trim()} aria-label="Adicionar" className="rounded-xl bg-coral px-4 text-white transition active:scale-95 disabled:opacity-40">
                <Plus size={22} />
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {suggestions.slice(0, 6).map((s) => (
                  <button key={s} type="button" onClick={() => add(s, category)} className="rounded-full border border-dashed border-teal-500/50 px-2.5 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-50">
                    + {s}
                  </button>
                ))}
              </div>
            )}
            {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
          </form>
        ) : (
          <p className="flex items-center gap-2 border-b border-orange-900/10 bg-white/70 px-5 py-3 text-sm text-slate-600 sm:px-6">
            <Lock size={15} /> Você pode ver, mas só o dono edita esta mala.
          </p>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
          {isLoading && <p className="py-10 text-center text-slate-500">Abrindo a mala…</p>}
          {!isLoading && items.length === 0 && (
            <div className="py-10 text-center text-slate-500">
              <div className="text-4xl">🏝️</div>
              <p className="mt-2">Mala vazia por enquanto.</p>
            </div>
          )}
          {CATEGORIES.map((c) => {
            const list = items.filter((i) => i.category === c.id);
            if (!list.length) return null;
            const catDone = list.filter((i) => i.checked).length;
            return (
              <div key={c.id} className="mb-5">
                <h3 className="mb-2 flex items-center justify-between font-display text-base font-semibold text-slate-700">
                  <span>{c.emoji} {c.label}</span>
                  <span className="text-xs font-bold text-slate-400">{catDone}/{list.length}</span>
                </h3>
                <ul className="space-y-1.5">
                  <AnimatePresence initial={false}>
                    {list.map((it) => (
                      <motion.li key={it.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className="group flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-orange-900/5">
                        <button
                          onClick={() => editable && toggle(it)}
                          disabled={!editable}
                          role="checkbox"
                          aria-checked={it.checked}
                          aria-label={it.text}
                          className={`grid size-6 shrink-0 place-items-center rounded-lg border-2 transition ${it.checked ? "border-transparent text-white" : "border-slate-300 bg-white"} ${editable ? "active:scale-90" : "cursor-default"}`}
                          style={it.checked ? { background: color } : undefined}
                        >
                          {it.checked && <Check size={16} strokeWidth={3.5} />}
                        </button>
                        <span className={`min-w-0 flex-1 break-words ${it.checked ? "text-slate-400 line-through" : "text-slate-800"}`}>
                          {it.text}
                          {bagId === "geral" && it.addedBy && <span className="ml-1.5 text-xs text-slate-400 no-underline">· {it.addedBy}</span>}
                        </span>
                        {editable && (
                          <button onClick={() => remove(it)} aria-label={`Remover ${it.text}`} className="rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}
