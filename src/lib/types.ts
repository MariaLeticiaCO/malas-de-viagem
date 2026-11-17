export type Bag = {
  id: string;
  name: string;
  color: string;
  createdAt: number;
};

export type Item = {
  id: string;
  text: string;
  category: CategoryId;
  checked: boolean;
  addedBy: string;
  createdAt: number;
};

export type CategoryId =
  | "banho"
  | "roupas"
  | "higiene"
  | "alimentos"
  | "eletro"
  | "limpeza"
  | "praia"
  | "saude"
  | "documentos"
  | "outros";

export const GENERAL_BAG_ID = "geral";

export type StopKind =
  | "passeio"
  | "praia"
  | "comida"
  | "festa"
  | "trilha"
  | "compras"
  | "transporte"
  | "hospedagem";

export type Stop = {
  id: string;
  title: string;
  place: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  kind: StopKind;
  notes: string;
  createdAt: number;
};

/** Stop as sent to the client, with everyone's ratings (userId -> 1..5). */
export type StopWithRatings = Stop & { ratings: Record<string, number> };

export type Trip = { ownerId: string | null };
