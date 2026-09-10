"use client";
import { useEffect, useRef } from "react";
import { ServiceVideo } from "./BookingFlow";

// Carte vidéo TikTok qui tourne automatiquement (autoplay + loop), avec gestion
// des posts "carousel" (plusieurs images) via l'API postMessage du player TikTok :
// on fait défiler les images toutes les 3s tant que TikTok confirme qu'il s'agit
// bien d'un carousel (événement "onImageChange") ; sinon la vidéo tourne juste en
// loop, sans intervention. Exportée pour être composée par PortfolioGallery.
const CAROUSEL_INTERVAL_MS = 3000;

export function TikTokCard({ videoId, caption }: { videoId: string; caption?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const state = {
      isCarousel: false,
      waitingForResponse: false,
      lastConfirmedIndex: 0,
    };
    let carouselTimer: ReturnType<typeof setInterval> | null = null;
    let probeTimeout: ReturnType<typeof setTimeout> | null = null;
    let probeResetTimeout: ReturnType<typeof setTimeout> | null = null;

    function post(type: string, value?: number) {
      if (!iframe?.contentWindow) return;
      const message: Record<string, unknown> = { "x-tiktok-player": true, type };
      if (value !== undefined) message.value = value;
      iframe.contentWindow.postMessage(message, "*");
    }

    // Sonde initiale : on tente navigateTo(1). Si TikTok répond par
    // "onImageChange", c'est un carousel -> on active le défilement auto.
    // Sinon (silence), c'est un post vidéo classique -> la vidéo tourne déjà
    // en loop via l'URL de l'iframe, rien d'autre à faire.
    probeTimeout = setTimeout(() => {
      state.waitingForResponse = true;
      post("navigateTo", 1);
      probeResetTimeout = setTimeout(() => {
        state.waitingForResponse = false;
      }, 1200);
    }, 1200);

    carouselTimer = setInterval(() => {
      if (!state.isCarousel || state.waitingForResponse) return;

      const nextIndex = state.lastConfirmedIndex + 1;
      state.waitingForResponse = true;
      post("navigateTo", nextIndex);

      setTimeout(() => {
        if (state.waitingForResponse) {
          state.waitingForResponse = false;
          state.lastConfirmedIndex = 0;
          post("navigateTo", 0);
        }
      }, 1200);
    }, CAROUSEL_INTERVAL_MS);

    function onMessage(event: MessageEvent) {
      if (event.origin !== "https://www.tiktok.com") return;
      if (event.source !== iframe?.contentWindow) return;

      const data = event.data;
      if (!data || data["x-tiktok-player"] !== true) return;

      if (data.type === "onImageChange" && typeof data.value === "number") {
        state.isCarousel = true;
        state.waitingForResponse = false;
        state.lastConfirmedIndex = data.value;
      }
    }

    window.addEventListener("message", onMessage);
    return () => {
      if (probeTimeout) clearTimeout(probeTimeout);
      if (probeResetTimeout) clearTimeout(probeResetTimeout);
      if (carouselTimer) clearInterval(carouselTimer);
      window.removeEventListener("message", onMessage);
    };
  }, [videoId]);

  return (
    <div>
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-stone-900 shadow-sm">
        <iframe
          ref={iframeRef}
          src={`https://www.tiktok.com/player/v1/${videoId}?autoplay=1&loop=1&controls=0&progress_bar=0&timestamp=0&music_info=0&description=0&native_context_menu=0`}
          allow="autoplay; fullscreen"
          loading="lazy"
          className="w-full h-full border-0 block"
          title={`TikTok ${videoId}`}
        />
      </div>
      {caption && <p className="mt-1.5 text-xs text-stone-500 truncate">{caption}</p>}
    </div>
  );
}

export default function VideoPortfolio({ videos }: { videos?: ServiceVideo[] }) {
  const sorted = (videos ?? []).slice().sort((a, b) => a.position - b.position);
  if (sorted.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {sorted.map((v) =>
        v.platform === "tiktok" ? <TikTokCard key={v.id} videoId={v.video_id} /> : null,
      )}
    </div>
  );
}
