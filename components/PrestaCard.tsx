"use client";
import { useState } from "react";
import { Presta } from "./BookingFlow";
import { PhoneIcon, LocationIcon, InstagramIcon, TiktokIcon, GlobeIcon, LinkIcon } from "./icons";

// Colonne de gauche, sticky : toute l'identité du presta (photo, nom, bio,
// téléphone, adresse, réseaux) réunie au même endroit, plutôt qu'éclatée entre
// le haut et le bas de la page. Chaque ligne n'apparaît que si le champ
// correspondant est renseigné — pas de placeholder grisé pour les champs vides.
// Instagram/TikTok n'affichent que le pseudo (pas de lien de redirection).
// PRO-05 : « bookmeagain.com » saisi sans https:// devenait un lien relatif
// (bookmeagain.com/madavola/bookmeagain.com). On ajoute https:// et on écarte
// tout ce qui n'est pas http(s) (javascript:, etc.).
function toExternalUrl(raw?: string | null): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v.replace(/^\/+/, "")}`;
  try {
    const u = new URL(withScheme);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export default function PrestaCard({ presta }: { presta: Presta }) {
  const website   = toExternalUrl(presta.website);
  const otherLink = toExternalUrl(presta.other_link);
  const links = [
    website   && { href: website,   label: "Site web",  Icon: GlobeIcon },
    otherLink && { href: otherLink, label: "Autre lien", Icon: LinkIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof GlobeIcon }[];
  // Bio repliée à 3 lignes : sur mobile, une longue bio repoussait les
  // prestations hors du premier écran.
  const [bioOpen, setBioOpen] = useState(false);
  const longBio = (presta.bio ?? "").length > 160;

  return (
    <aside className="lg:sticky lg:top-6 bg-surface rounded-2xl border border-stone-200 overflow-hidden">
      {presta.avatar_url && (
        <img
          src={presta.avatar_url}
          alt={presta.name}
          className="w-full aspect-[16/9] lg:aspect-[4/3] object-cover bg-stone-100"
        />
      )}

      <div className="p-5 sm:p-6">
        <h1 className="font-head text-2xl font-semibold text-stone-900 leading-tight">{presta.name}</h1>
        {presta.city && (
          <p className="flex items-center gap-1.5 text-sm text-stone-500 mt-1">
            <LocationIcon className="w-3.5 h-3.5 text-stone-400" />
            {presta.city}
          </p>
        )}
        {presta.bio && (
          <div className="mt-3">
            <p className={`text-sm text-stone-600 leading-relaxed whitespace-pre-line ${bioOpen ? "" : "line-clamp-3"}`}>{presta.bio}</p>
            {longBio && (
              <button type="button" onClick={() => setBioOpen(o => !o)} aria-expanded={bioOpen}
                className="mt-1 text-sm font-semibold text-accent-600 hover:text-accent-700">
                {bioOpen ? "Réduire" : "Lire la suite"}
              </button>
            )}
          </div>
        )}

        {(presta.phone || presta.instagram || presta.tiktok || links.length > 0) && (
          <div className="flex flex-wrap gap-x-5 gap-y-2.5 mt-4 pt-4 border-t border-stone-100 lg:flex-col lg:flex-nowrap">
            {presta.phone && (
              <a href={`tel:${presta.phone}`} className="flex items-center gap-3 text-sm text-stone-700 hover:text-accent-600 transition-colors">
                <PhoneIcon className="text-stone-400" />
                {presta.phone}
              </a>
            )}

            {presta.instagram && (
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <InstagramIcon className="text-stone-400" />
                {presta.instagram}
              </div>
            )}

            {presta.tiktok && (
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <TiktokIcon className="text-stone-400" />
                {presta.tiktok}
              </div>
            )}

            {links.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-stone-700 hover:text-accent-600 transition-colors">
                <Icon className="text-stone-400" />
                {label}
              </a>
            ))}
          </div>
        )}

      </div>
    </aside>
  );
}
