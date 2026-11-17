import type { Metadata, Viewport } from "next";
import { Caveat, Fredoka, Nunito, Pirata_One } from "next/font/google";
import "./globals.css";
import { Pwa } from "@/components/Pwa";

const display = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["500", "600", "700"] });
const sans = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const pirate = Pirata_One({ variable: "--font-pirata", subsets: ["latin"], weight: "400" });
const hand = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Malas de Viagem",
  description: "A lista de viagem da turma: cada um com sua mala, e uma mala geral para todos.",
  appleWebApp: { capable: true, title: "Malas", statusBarStyle: "default" },
  applicationName: "Malas de Viagem",
};

export const viewport: Viewport = { themeColor: "#FFF4E0", width: "device-width", initialScale: 1, viewportFit: "cover" };

// Captures the browser's install offer early, before React loads, so /instalar can use it.
const installScript = `addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__malasInstall=e;dispatchEvent(new Event('malas-installable'));});`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} ${pirate.variable} ${hand.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: installScript }} />
      </head>
      <body className="min-h-dvh">
        {children}
        <Pwa />
      </body>
    </html>
  );
}
