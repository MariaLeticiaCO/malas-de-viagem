import type { StopKind } from "./types";

export const STOP_KINDS: { id: StopKind; label: string; emoji: string }[] = [
  { id: "passeio", label: "Passeio", emoji: "📸" },
  { id: "praia", label: "Praia", emoji: "🏖️" },
  { id: "comida", label: "Comer", emoji: "🍽️" },
  { id: "festa", label: "Festa", emoji: "🎉" },
  { id: "trilha", label: "Trilha", emoji: "🥾" },
  { id: "compras", label: "Compras", emoji: "🛍️" },
  { id: "transporte", label: "Estrada", emoji: "🚗" },
  { id: "hospedagem", label: "Hospedagem", emoji: "🏨" },
];

export const STOP_KIND_IDS = STOP_KINDS.map((k) => k.id);
export const kindOf = (id: StopKind) => STOP_KINDS.find((k) => k.id === id) ?? STOP_KINDS[0];
