"use client";
import { useEffect, useRef } from "react";
import { ServiceVideo } from "./BookingFlow";

// Grille de vidéos qui tournent automatiquement, façon "portfolio vivant" du
// presta pour ce service. Pour l'instant seul TikTok est géré (embed player
// officiel). Le composant gère aussi le cas des posts "carousel" (plusieurs
// images) via l'API postMessage du player TikTok : on fait défiler les
// images toutes les 3s tant que TikTok confirme qu'il s'agit bien d'un
// carousel (événement "onImageChange") ; sinon la vidéo tourne juste en loop.
const CAROUSEL_INTERVAL_MS = 3000;

function TikTokCard({ videoId }: { videoId: string }) {
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
    // Sinon (silence), c'est un post vidéo classique -> rien à faire, la
    // vidéo tourne déjà en loop via l'URL de l'iframe.
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

      // Si aucun nouvel index n'est confirmé, on a atteint la dernière image
      // du carousel : retour à la première.
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
    <div className="relative w-full aspect-[16/10] overflow-hidden rounded-xl bg-stone-900 shadow-sm">
      <iframe
        ref={iframeRef}
        src={`https://www.tiktok.com/player/v1/${videoId}?autoplay=1&loop=1&controls=0&progress_bar=0&timestamp=0&music_info=0&description=0&native_context_menu=0`}
        allow="autoplay; fullscreen"
        loading="lazy"
        className="w-full h-full border-0 block"
        title={`TikTok ${videoId}`}
      />
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
