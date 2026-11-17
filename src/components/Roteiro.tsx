"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { AnimatePresence, motion } from "motion/react";
import { Crown, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { api, fetcher, type TripResponse } from "@/lib/client";
import { kindOf } from "@/lib/stops";
import type { Bag, StopWithRatings } from "@/lib/types";
import { StopForm, type StopDraft } from "./StopForm";

const KEY = "/api/roteiro";

type Props = { user: Bag; bags: Bag[]; onOwnerChange: () => void };

export function Roteiro({ user, bags, onOwnerChange }: Props) {
  const { data, mutate, isLoading } = useSWR<TripResponse>(KEY, fetcher, { refreshInterval: 5000 });
  const [editing, setEditing] = useState<StopDraft | null>(null);
  const [error, setError] = useState("");

  const ownerId = data?.ownerId ?? null;
  const owner = bags.find((b) => b.id === ownerId) ?? null;
  const isOwner = ownerId === user.id;
  const stops = useMemo(() => data?.stops ?? [], [data]);
  const days = useMemo(() => groupByDay(stops), [stops]);

  async function run(optimistic: TripResponse, action: () => Promise<unknown>) {
    setError("");
    try {
      await mutate(
        async () => {
          await action();
          return fetcher(KEY);
        },
        { optimisticData: optimistic, rollbackOnError: true, revalidate: false },
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const crown = (id: string) =>
    run({ ownerId: id, stops }, () => api("/api/roteiro/dono", "PUT", user, { ownerId: id })).then(onOwnerChange);

  const rate = (stop: StopWithRatings, stars: number) => {
    const next = stop.ratings[user.id] === stars ? 0 : stars;
    const ratings = { ...stop.ratings };
    if (next) ratings[user.id] = next;
    else delete ratings[user.id];
    return run({ ownerId, stops: stops.map((s) => (s.id === stop.id ? { ...s, ratings } : s)) }, () =>
      api(`/api/roteiro/paradas/${stop.id}/avaliacao`, "PUT", user, { stars: next }),
    );
  };

  const remove = (stop: StopWithRatings) => {
    if (!confirm(`Apagar "${stop.title}" do mapa?`)) return;
    return run({ ownerId, stops: stops.filter((s) => s.id !== stop.id) }, () =>
      api(`/api/roteiro/paradas/${stop.id}`, "DELETE", user),
    );
  };

  const clearAll = () =>
    run({ ownerId, stops: [] }, () => api(KEY, "DELETE", user));

  async function save(draft: StopDraft) {
    const { id, ...fields } = draft;
    if (id) await api(`/api/roteiro/paradas/${id}`, "PATCH", user, fields);
    else await api("/api/roteiro/paradas", "POST", user, fields);
    await mutate();
    setEditing(null);
  }

  const lastDate = stops.at(-1)?.date;

  return (
    <div className="relative mx-auto mt-6 max-w-2xl">
      <div className="scroll-rod relative z-10 mx-1" />
      <section className="parchment mx-4 -my-[11px] px-4 pt-9 pb-12 sm:px-8">
        <header className="text-center">
          <p className="font-hand text-xl text-ink/70">o roteiro da viagem</p>
          <h1 className="font-pirate text-[2.6rem] leading-none text-ink sm:text-5xl">Mapa do Tesouro</h1>
        </header>

        <OwnerPanel user={user} bags={bags} owner={owner} isOwner={isOwner} onCrown={crown} />

        {error && <p className="mt-3 text-center text-sm font-bold text-treasure">{error}</p>}

        {isOwner && (
          <button
            onClick={() => setEditing({ title: "", place: "", date: lastDate ?? today(), time: "10:00", kind: "passeio", notes: "" })}
            className="mx-auto mt-6 flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-display font-semibold text-parch shadow-lg shadow-ink/30 transition active:scale-95"
          >
            <Plus size={20} /> Nova parada no mapa
          </button>
        )}

        {isLoading && <p className="mt-10 text-center font-hand text-2xl text-ink/60">Desenrolando o mapa…</p>}

        {!isLoading && stops.length === 0 && (
          <div className="mt-10 text-center">
            <div className="text-5xl">🗺️</div>
            <p className="mt-2 font-hand text-2xl text-ink/80">O mapa ainda está em branco.</p>
            <p className="mt-1 text-sm text-ink/70">
              {owner ? (isOwner ? "Adicione a primeira parada do rolê!" : `${owner.name} vai desenhar o caminho.`) : "Escolha o dono do rolê para começar."}
            </p>
          </div>
        )}

        <div className="mt-6">
          {days.map(([date, list], d) => (
            <div key={date} className="mt-6">
              <DayHeader date={date} index={d} />
              <ol className="mt-3">
                {list.map((stop, i) => {
                  return (
                    <StopRow
                      key={stop.id}
                      stop={stop}
                      n={stops.indexOf(stop) + 1}
                      side={i % 2 === 0 ? "left" : "right"}
                      last={i === list.length - 1}
                      user={user}
                      isOwner={isOwner}
                      onRate={(s) => rate(stop, s)}
                      onEdit={() => setEditing({ id: stop.id, title: stop.title, place: stop.place, date: stop.date, time: stop.time, kind: stop.kind, notes: stop.notes })}
                      onDelete={() => remove(stop)}
                    />
                  );
                })}
              </ol>
            </div>
          ))}

          {isOwner && stops.length > 0 && <ClearRoteiro count={stops.length} onConfirm={clearAll} />}

          {stops.length > 0 && (
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 260, damping: 12 }} className="mt-8 flex flex-col items-center">
              <svg viewBox="0 0 40 40" className="size-14" aria-hidden>
                <path d="M8 8 L32 32 M32 8 L8 32" stroke="#c0392b" strokeWidth="6" strokeLinecap="round" />
              </svg>
              <p className="font-pirate text-2xl text-treasure">O tesouro é a viagem!</p>
            </motion.div>
          )}
        </div>
      </section>
      <div className="scroll-rod relative z-10 mx-1" />

      <AnimatePresence>
        {editing && <StopForm key="form" initial={editing} onCancel={() => setEditing(null)} onSave={save} />}
      </AnimatePresence>
    </div>
  );
}

function OwnerPanel({
  user,
  bags,
  owner,
  isOwner,
  onCrown,
}: {
  user: Bag;
  bags: Bag[];
  owner: Bag | null;
  isOwner: boolean;
  onCrown: (id: string) => void;
}) {
  const [picking, setPicking] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const open = picking || !owner;

  return (
    <div className="mt-6 rounded-2xl border-2 border-dashed border-ink/25 bg-white/25 p-4">
      {owner && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full text-white shadow" style={{ background: owner.color }}>
              <Crown size={22} fill="#FFC83D" stroke="#9a6a00" />
            </span>
            <div className="min-w-0">
              <p className="font-hand text-lg leading-none text-ink/70">dono do rolê</p>
              <p className="truncate font-display text-xl font-bold">{owner.id === user.id ? `${owner.name} (você)` : owner.name}</p>
            </div>
          </div>
          {isOwner && !picking && (
            <button onClick={() => setPicking(true)} className="shrink-0 rounded-full border-2 border-ink/30 px-3 py-1.5 text-sm font-bold transition hover:bg-ink/10">
              Passar a coroa
            </button>
          )}
        </div>
      )}

      {open && (
        <div className={owner ? "mt-4 border-t-2 border-dashed border-ink/15 pt-4" : ""}>
          <p className="font-display font-semibold">{owner ? "Para quem vai a coroa?" : "👑 Quem é o dono do rolê?"}</p>
          <p className="text-sm text-ink/70">Quem for escolhido monta e edita o roteiro. Todo mundo vê e avalia.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {bags.map((b) => (
              <button
                key={b.id}
                onClick={() => setChoice(b.id)}
                aria-pressed={choice === b.id}
                className={`flex items-center gap-2 rounded-full border-2 py-1 pr-3 pl-1 font-semibold transition ${choice === b.id ? "border-ink bg-ink text-parch" : "border-ink/20 bg-white/40 hover:border-ink/50"}`}
              >
                <span className="size-6 rounded-full" style={{ background: b.color }} />
                {b.name}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              disabled={!choice || choice === owner?.id}
              onClick={() => {
                if (!choice) return;
                onCrown(choice);
                setPicking(false);
                setChoice(null);
              }}
              className="flex items-center gap-1.5 rounded-full bg-treasure px-4 py-2 font-display font-semibold text-white shadow transition active:scale-95 disabled:opacity-40"
            >
              <Crown size={18} /> Coroar
            </button>
            {owner && (
              <button onClick={() => { setPicking(false); setChoice(null); }} className="rounded-full px-4 py-2 font-semibold text-ink/70">
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DayHeader({ date, index }: { date: string; index: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl">{["🏝️", "⛵", "🗿", "🌋", "🐚", "🦜", "🏰"][index % 7]}</span>
      <div>
        <p className="font-pirate text-2xl leading-none">Dia {index + 1}</p>
        <p className="font-hand text-xl leading-tight text-ink/75">{formatDay(date)}</p>
      </div>
      <span className="h-0.5 flex-1 rounded bg-[repeating-linear-gradient(90deg,rgba(74,44,18,0.35)_0_8px,transparent_8px_14px)]" />
    </div>
  );
}

function StopRow({
  stop,
  n,
  side,
  last,
  user,
  isOwner,
  onRate,
  onEdit,
  onDelete,
}: {
  stop: StopWithRatings;
  n: number;
  side: "left" | "right";
  last: boolean;
  user: Bag;
  isOwner: boolean;
  onRate: (stars: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const kind = kindOf(stop.kind);
  const values = Object.values(stop.ratings);
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const mine = stop.ratings[user.id] ?? 0;
  const x = side === "left" ? 18 : 50;
  const nextX = side === "left" ? 50 : 18;

  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className="relative flex gap-3 pb-5"
    >
      {/* trail column: marker + dashed path to the next stop */}
      <div className="relative w-[68px] shrink-0">
        {!last && (
          <svg className="absolute top-8 left-0 h-[calc(100%-12px)] w-[68px] overflow-visible" viewBox="0 0 68 100" preserveAspectRatio="none" aria-hidden>
            <path
              d={`M${x} 0 C ${x} 55, ${nextX} 45, ${nextX} 100`}
              fill="none"
              stroke="#7a3b10"
              strokeWidth="3"
              strokeDasharray="7 7"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
        <div className="absolute top-0 grid size-[52px] -translate-x-1/2 place-items-center rounded-full border-[3px] border-ink/70 bg-[#fbeccb] text-2xl shadow-md" style={{ left: x }}>
          {kind.emoji}
          <span className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-treasure text-xs font-bold text-white ring-2 ring-[#fbeccb]">{n}</span>
        </div>
      </div>

      <article className="min-w-0 flex-1 rounded-2xl border-2 border-ink/15 bg-[#fff6df]/80 p-3.5 shadow-[0_6px_14px_-8px_rgba(74,44,18,0.5)]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink/70">
              <span className="rounded-md bg-ink px-1.5 py-0.5 font-display text-parch tabular-nums">{stop.time}</span>
              <span className="ml-2">{kind.label}</span>
            </p>
            <h3 className="mt-1.5 font-display text-lg leading-snug font-bold break-words">{stop.title}</h3>
          </div>
          {isOwner && (
            <div className="-mt-1 -mr-1 flex shrink-0">
              <button onClick={onEdit} aria-label={`Editar ${stop.title}`} className="rounded-lg p-2 text-ink/60 transition hover:bg-ink/10 hover:text-ink">
                <Pencil size={16} />
              </button>
              <button onClick={onDelete} aria-label={`Apagar ${stop.title}`} className="rounded-lg p-2 text-ink/60 transition hover:bg-treasure/10 hover:text-treasure">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {stop.place && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.place)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex max-w-full items-center gap-1 text-sm font-semibold text-[#0f6f8a] underline decoration-dotted underline-offset-2"
          >
            <MapPin size={14} className="shrink-0" /> <span className="truncate">{stop.place}</span>
          </a>
        )}
        {stop.notes && <p className="mt-1.5 font-hand text-lg leading-snug text-ink/85">{stop.notes}</p>}

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-dashed border-ink/20 pt-2">
          <div className="flex" role="radiogroup" aria-label="Sua avaliação">
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 1.35, rotate: 12 }}
                onClick={() => onRate(s)}
                role="radio"
                aria-checked={mine === s}
                aria-label={`${s} estrela${s > 1 ? "s" : ""}`}
                className="p-0.5"
              >
                <Star size={24} className={s <= mine ? "fill-[#FFC23C] text-[#d48a00]" : "text-ink/35"} strokeWidth={2} />
              </motion.button>
            ))}
          </div>
          <p className="text-xs font-bold text-ink/65">
            {values.length ? <>★ {avg.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} · {values.length} {values.length === 1 ? "voto" : "votos"}</> : "Como foi? Avalie!"}
          </p>
        </div>
      </article>
    </motion.li>
  );
}

function groupByDay(stops: StopWithRatings[]) {
  const map = new Map<string, StopWithRatings[]>();
  for (const s of stops) map.set(s.date, [...(map.get(s.date) ?? []), s]);
  return [...map.entries()];
}

function formatDay(date: string) {
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Owner only: erase every stop, with a two-step confirmation. */
function ClearRoteiro({ count, onConfirm }: { count: number; onConfirm: () => Promise<void> | void }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!confirming)
    return (
      <div className="mt-8 text-center">
        <button onClick={() => setConfirming(true)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-ink/55 transition hover:bg-treasure/10 hover:text-treasure">
          <Trash2 size={15} /> Apagar o roteiro inteiro
        </button>
      </div>
    );

  return (
    <div className="mt-8 rounded-2xl border-2 border-dashed border-treasure/50 bg-[#fff1e6]/80 p-4 text-center">
      <p className="font-pirate text-2xl text-treasure">Apagar o mapa todo?</p>
      <p className="mt-1 text-sm text-ink/80">
        {count === 1 ? "A parada" : `As ${count} paradas`} e todas as avaliações somem para todo mundo. Você continua dono do rolê. Não dá para desfazer.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={() => setConfirming(false)} disabled={busy} className="rounded-full px-4 py-2 font-semibold text-ink/70 hover:bg-ink/10">
          Voltar
        </button>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onConfirm();
            setBusy(false);
            setConfirming(false);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-treasure px-4 py-2 font-semibold text-white shadow transition active:scale-95 disabled:opacity-60"
        >
          <Trash2 size={16} /> Apagar roteiro
        </button>
      </div>
    </div>
  );
}
