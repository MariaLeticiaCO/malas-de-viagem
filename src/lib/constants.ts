import type { CategoryId } from "./types";

export const BAG_COLORS = [
  { name: "Coral", value: "#FF6B57" },
  { name: "Sol", value: "#FFC23C" },
  { name: "Tangerina", value: "#FF9548" },
  { name: "Melancia", value: "#F2547D" },
  { name: "Flamingo", value: "#FF8FB8" },
  { name: "Turquesa", value: "#1FB5AC" },
  { name: "Oceano", value: "#2E86DE" },
  { name: "Coqueiro", value: "#4CB963" },
  { name: "Lavanda", value: "#9B7BFF" },
  { name: "Areia", value: "#D9A86C" },
] as const;

export const GENERAL_BAG_COLOR = "#0FA3B1";

export const CATEGORIES: {
  id: CategoryId;
  label: string;
  emoji: string;
  suggestions: string[];
}[] = [
  { id: "roupas", label: "Roupas", emoji: "👕", suggestions: ["Camisetas", "Bermudas", "Pijama", "Roupas íntimas", "Casaco leve", "Chinelo", "Tênis"] },
  { id: "praia", label: "Praia & Lazer", emoji: "🏖️", suggestions: ["Biquíni / sunga", "Canga", "Óculos de sol", "Boné / chapéu", "Guarda-sol", "Cadeira de praia", "Cooler"] },
  { id: "banho", label: "Banho & Cama", emoji: "🛁", suggestions: ["Toalha de banho", "Toalha de rosto", "Lençol", "Travesseiro", "Fronha", "Cobertor"] },
  { id: "higiene", label: "Higiene", emoji: "🪥", suggestions: ["Escova de dente", "Pasta de dente", "Shampoo", "Condicionador", "Sabonete", "Desodorante", "Protetor solar"] },
  { id: "alimentos", label: "Alimentos", emoji: "🍉", suggestions: ["Água", "Frutas", "Café", "Pão", "Biscoitos", "Carnes p/ churrasco", "Gelo"] },
  { id: "eletro", label: "Eletrônicos & Eletrodomésticos", emoji: "🔌", suggestions: ["Carregador", "Power bank", "Caixa de som", "Extensão / benjamim", "Secador", "Ventilador"] },
  { id: "limpeza", label: "Limpeza", emoji: "🧽", suggestions: ["Detergente", "Esponja", "Saco de lixo", "Papel higiênico", "Pano de prato", "Repelente"] },
  { id: "saude", label: "Remédios & Saúde", emoji: "💊", suggestions: ["Remédios de uso contínuo", "Analgésico", "Antialérgico", "Curativos", "Pós-sol"] },
  { id: "documentos", label: "Documentos", emoji: "🪪", suggestions: ["RG / CNH", "Cartões", "Dinheiro", "Reservas", "Carteirinha do plano"] },
  { id: "outros", label: "Outros", emoji: "✨", suggestions: [] },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
