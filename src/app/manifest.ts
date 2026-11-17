import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Malas de Viagem",
    short_name: "Malas",
    description: "A lista de viagem da turma: cada um com sua mala, uma mala geral e o mapa do tesouro do roteiro.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFF4E0",
    theme_color: "#FF6B57",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["travel", "lifestyle", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Malas", url: "/", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Roteiro", url: "/?aba=roteiro", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
