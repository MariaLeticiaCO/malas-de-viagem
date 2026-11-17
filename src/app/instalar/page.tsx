"use client";

import { Check, Copy, Download, EllipsisVertical, Share, SquarePlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
type Platform = "ios-safari" | "ios-other" | "android" | "other";

declare global {
  interface Window {
    __malasInstall?: InstallEvent;
  }
}

function detect(): Platform {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) return /CriOS|FxiOS|EdgiOS|OPiOS|Instagram|FBAN|FBAV|WhatsApp/.test(ua) ? "ios-other" : "ios-safari";
  if (/Android/.test(ua)) return "android";
  return "other";
}

const standalone = () =>
  matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;

function subscribe(onChange: () => void) {
  addEventListener("malas-installable", onChange);
  addEventListener("appinstalled", onChange);
  return () => {
    removeEventListener("malas-installable", onChange);
    removeEventListener("appinstalled", onChange);
  };
}

const noop = () => () => {};

export default function InstallPage() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const offer = useSyncExternalStore(subscribe, () => window.__malasInstall ?? null, () => null);
  const [accepted, setAccepted] = useState(false);
  const [used, setUsed] = useState(false);
  const prompt = used ? null : offer;
  const installed = hydrated && (accepted || standalone());
  const platform: Platform = hydrated ? detect() : "other";

  useEffect(() => {
    const done = () => setAccepted(true);
    addEventListener("appinstalled", done);
    return () => removeEventListener("appinstalled", done);
  }, []);

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    window.__malasInstall = undefined;
    setUsed(true);
    if (outcome === "accepted") setAccepted(true);
  }

  const primary = "flex w-full items-center justify-center gap-2 rounded-2xl bg-coral px-5 py-3.5 font-display text-lg font-semibold text-white shadow-lg shadow-coral/30 transition active:scale-[0.98]";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-10">
      <div className="mt-6 flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" width={104} height={104} className="rounded-[1.8rem] shadow-xl shadow-orange-900/20" />
        <h1 className="mt-6 font-display text-4xl font-bold text-slate-800">Baixe o Malas</h1>
        <p className="mt-2 max-w-[34ch] text-slate-600">
          Instale no celular e abra pela tela inicial, como qualquer app. É grátis e todo mundo da viagem pode baixar.
        </p>
      </div>

      <div className="mt-8 rounded-[2rem] bg-white/85 p-6 shadow-xl shadow-orange-900/5 ring-1 ring-orange-900/5">
        {!hydrated ? (
          <div className="h-24" aria-busy />
        ) : installed ? (
          <div className="text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-teal-100 text-teal-700">
              <Check size={24} aria-hidden />
            </span>
            <p className="mt-4 font-semibold">O app já está instalado neste aparelho.</p>
            <Link href="/" className={`${primary} mt-5`}>Abrir o app</Link>
          </div>
        ) : prompt ? (
          <div className="text-center">
            <button className={primary} onClick={install}>
              <Download size={20} aria-hidden /> Instalar o app
            </button>
            <p className="mt-3 text-sm text-slate-500">O ícone aparece na sua tela inicial.</p>
          </div>
        ) : platform === "ios-safari" ? (
          <Steps
            title="No iPhone, são 3 toques:"
            items={[
              <>Toque em <Icon><Share size={16} /></Icon> <b>Compartilhar</b>, na barra do Safari</>,
              <>Role e toque em <Icon><SquarePlus size={16} /></Icon> <b>Adicionar à Tela de Início</b></>,
              <>Toque em <b>Adicionar</b>, no canto de cima</>,
            ]}
          />
        ) : platform === "ios-other" ? (
          <Steps
            title="No iPhone, a instalação é pelo Safari:"
            items={[
              <>Copie o link abaixo e abra no <b>Safari</b></>,
              <>Toque em <Icon><Share size={16} /></Icon> <b>Compartilhar</b></>,
              <>Toque em <b>Adicionar à Tela de Início</b></>,
            ]}
            copy
          />
        ) : platform === "android" ? (
          <Steps
            title="No Android, pelo Chrome:"
            items={[
              <>Toque no menu <Icon><EllipsisVertical size={16} /></Icon> no canto de cima</>,
              <>Toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b></>,
              <>Confirme em <b>Instalar</b></>,
            ]}
          />
        ) : (
          <Steps
            title="Abra este link no seu celular:"
            items={[
              <>No <b>Android</b>, use o Chrome e toque em <b>Instalar app</b></>,
              <>No <b>iPhone</b>, use o Safari e toque em <b>Adicionar à Tela de Início</b></>,
            ]}
            copy
          />
        )}
      </div>

      <Link href="/" className="mx-auto mt-6 text-sm font-semibold text-slate-500 hover:text-slate-800">
        Continuar no navegador
      </Link>
    </main>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return <span className="mx-0.5 inline-grid size-7 place-items-center rounded-lg bg-orange-100 align-middle text-coral">{children}</span>;
}

function Steps({ title, items, copy }: { title: string; items: ReactNode[]; copy?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="font-semibold">{title}</p>
      <ol className="mt-4 space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 leading-relaxed text-slate-600">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-coral text-sm font-bold text-white">{i + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
      {copy && (
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(location.origin);
              setCopied(true);
            } catch {}
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-coral/40 py-3 font-semibold text-coral"
        >
          {copied ? <><Check size={18} /> Link copiado</> : <><Copy size={18} /> Copiar link do app</>}
        </button>
      )}
    </div>
  );
}
