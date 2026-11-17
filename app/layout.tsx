import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, Bricolage_Grotesque, Inter, Space_Grotesk, Fraunces, Playfair_Display } from "next/font/google";
import "./globals.css";

// Polices des ambiances (cf. lib/themes.ts). Seule Plus Jakarta Sans,
// l'ambiance par défaut, est préchargée ; les autres ne sont téléchargées
// que si la page de la presta les utilise.
const jakarta    = Plus_Jakarta_Sans({ variable: "--f-jakarta", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const dmsans     = DM_Sans({ variable: "--f-dmsans", subsets: ["latin"], weight: ["400", "500", "600", "700"], preload: false });
const bricolage  = Bricolage_Grotesque({ variable: "--f-bricolage", subsets: ["latin"], weight: ["600", "700"], preload: false });
const inter      = Inter({ variable: "--f-inter", subsets: ["latin"], weight: ["400", "500", "600", "700"], preload: false });
const space      = Space_Grotesk({ variable: "--f-space", subsets: ["latin"], weight: ["600", "700"], preload: false });
const fraunces   = Fraunces({ variable: "--f-fraunces", subsets: ["latin"], weight: ["600", "700"], preload: false });
const playfair   = Playfair_Display({ variable: "--f-playfair", subsets: ["latin"], weight: ["700"], preload: false });

export const metadata: Metadata = {
  title: "Book Me Again – Réservation en ligne",
  metadataBase: new URL("https://bookmeagain.com"),
  description: "Réservez votre rendez-vous en ligne, sans création de compte.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fonts = [jakarta, dmsans, bricolage, inter, space, fraunces, playfair].map(f => f.variable).join(" ");
  return (
    <html lang="fr" className={`${fonts} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
