import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Police de l'ambiance par défaut (Épuré). Les polices des autres ambiances
// sont chargées par la page de réservation elle-même, seulement si besoin
// (cf. lib/themes.ts, fontsHref).
const jakarta = Plus_Jakarta_Sans({ variable: "--f-jakarta", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

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
  return (
    <html lang="fr" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
