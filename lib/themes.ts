// Ambiances de la page de réservation : les mêmes que dans l'app
// (bookme-fresh/lib/theme.ts), choisies par la presta dans Profil › Apparence
// et enregistrées dans prestas.theme. À garder alignées avec l'app.
//
// Sur le web, la page a un fond teinté et des cartes claires : pour Épuré
// (fond blanc, cartes grises dans l'app) les deux sont inversés.

import type { CSSProperties } from "react";

export type WebTheme = {
  dark: boolean;
  bg: string; surface: string; surface2: string; border: string;
  text: string; muted: string;
  accent: string; onAccent: string; accentSoft: string;
  body: string; head: string; // variables CSS des polices (next/font)
};

const J = "var(--f-jakarta)", DM = "var(--f-dmsans)", BRIC = "var(--f-bricolage)",
      INTER = "var(--f-inter)", SPACE = "var(--f-space)", FRAUN = "var(--f-fraunces)", PLAY = "var(--f-playfair)";

export const WEB_THEMES: Record<string, WebTheme> = {
  epure:      { dark: false, bg: "#F5F5F8", surface: "#FFFFFF", surface2: "#ECECF2", border: "#E6E6EC", text: "#111114", muted: "#5E5F6E", accent: "#3B3BD6", onAccent: "#FFFFFF", accentSoft: "#EDEDFD", body: J, head: J },
  doux:       { dark: false, bg: "#FBF4F2", surface: "#FFFFFF", surface2: "#F4E6E2", border: "#EBD9D4", text: "#2A1A1F", muted: "#6B565C", accent: "#A3214F", onAccent: "#FFFFFF", accentSoft: "#F7DEE5", body: DM, head: BRIC },
  nuit:       { dark: true,  bg: "#0E1013", surface: "#181B20", surface2: "#22262D", border: "#2A2F37", text: "#F2F4F7", muted: "#A0A7B2", accent: "#C8F25A", onAccent: "#12150A", accentSoft: "#283212", body: INTER, head: SPACE },
  sauge:      { dark: false, bg: "#F6F5EF", surface: "#FFFFFF", surface2: "#ECEDE3", border: "#E2E3D8", text: "#1E2620", muted: "#5A665C", accent: "#4E6B55", onAccent: "#FFFFFF", accentSoft: "#E3EBE2", body: J, head: FRAUN },
  terracotta: { dark: false, bg: "#FBF6F0", surface: "#FFFFFF", surface2: "#F3E8DE", border: "#EEDFD4", text: "#2B1D16", muted: "#6E5A4E", accent: "#B5543A", onAccent: "#FFFFFF", accentSoft: "#F6E3DA", body: J, head: FRAUN },
  lilas:      { dark: false, bg: "#F8F6FC", surface: "#FFFFFF", surface2: "#EFEBF7", border: "#E5E0F0", text: "#1F1A2B", muted: "#625A73", accent: "#7A5CC4", onAccent: "#FFFFFF", accentSoft: "#ECE6F8", body: J, head: J },
  ornoir:     { dark: true,  bg: "#141312", surface: "#1E1C1A", surface2: "#26231F", border: "#2E2B27", text: "#F4EFE6", muted: "#A8A095", accent: "#D4AF6A", onAccent: "#1A1611", accentSoft: "#2E2920", body: J, head: PLAY },
  ocean:      { dark: false, bg: "#F3F7F8", surface: "#FFFFFF", surface2: "#E6EFF1", border: "#DCE6E9", text: "#0F2229", muted: "#4F6670", accent: "#0E6E78", onAccent: "#FFFFFF", accentSoft: "#DCEEF0", body: J, head: J },
};

export function themeOf(id?: string | null): WebTheme {
  return (id && WEB_THEMES[id]) || WEB_THEMES.epure;
}

/** Variables CSS lues par globals.css (palette stone/accent remappée). */
export function themeStyle(t: WebTheme): CSSProperties {
  return {
    "--t-bg": t.bg, "--t-surface": t.surface, "--t-surface2": t.surface2, "--t-border": t.border,
    "--t-text": t.text, "--t-muted": t.muted, "--t-accent": t.accent, "--t-on-accent": t.onAccent,
    "--t-accent-soft": t.accentSoft, "--t-font-body": t.body, "--t-font-head": t.head,
    colorScheme: t.dark ? "dark" : "light",
    backgroundColor: t.bg, color: t.text, fontFamily: t.body,
  } as CSSProperties;
}
