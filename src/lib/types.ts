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
