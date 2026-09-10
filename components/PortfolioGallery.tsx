"use client";
import { useMemo, useState } from "react";
import { Service } from "./BookingFlow";
import { TikTokCard } from "./VideoPortfolio";

// Galerie "Réalisations" : dès qu'un service a au moins une vidéo, elle
// s'affiche automatiquement ici -- pas besoin que le client sélectionne le
// service dans le flow de réservation. L'onglet "Tout" mélange les vidéos de
// tous les services ; les autres onglets reprennent le nom de chaque service
// et filtrent sur lui uniquement.
export default function PortfolioGallery({ services }: { services: Service[] }) {
  const servicesWithVideos = useMemo(
    () => services.filter(s => s.videos && s.videos.length > 0),
    [services],
  );

  const [active, setActive] = useState<string>("all");

  const items = useMemo(() => {
    const pool = active === "all" ? servicesWithVideos : servicesWithVideos.filter(s => s.id === active);
    return pool
      .flatMap(s => (s.videos ?? []).map(v => ({ video: v, service: s })))
      .sort((a, b) => a.video.position - b.video.position);
  }, [servicesWithVideos, active]);

  if (servicesWithVideos.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 mt-6">
      <h2 className="text-lg font-semibold text-stone-900 mb-4">Réalisations</h2>

      {servicesWithVideos.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1" role="tablist" aria-label="Filtrer les réalisations par prestation">
          <button
            role="tab"
            aria-selected={active === "all"}
            onClick={() => setActive("all")}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${active === "all" ? "bg-accent-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>
            Tout
          </button>
          {servicesWithVideos.map(s => (
            <button
              key={s.id}
              role="tab"
              aria-selected={active === s.id}
              onClick={() => setActive(s.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                ${active === s.id ? "bg-accent-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map(({ video, service }) =>
          video.platform === "tiktok" ? (
            <TikTokCard
              key={video.id}
              videoId={video.video_id}
              caption={`${service.name} · ${service.duration_min} min · ${service.price} €`}
            />
          ) : null,
        )}
      </div>
    </section>
  );
}
