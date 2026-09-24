"use client";

import { useEffect, useRef, useState } from "react";

export default function ScreenCapture({ onAnalyze, isAnalyzing }: { onAnalyze: (image: string) => void; isAnalyzing: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");

  async function startCapture() {
    setError("");
    try {
      const nextStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      setStream(nextStream);
      nextStream.getVideoTracks()[0].addEventListener("ended", stopCapture);
    } catch {
      setError("La capture a été annulée ou n’est pas disponible dans ce navigateur.");
    }
  }

  function stopCapture() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    onAnalyze(canvas.toDataURL("image/jpeg", 0.8));
  }

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [stream]);

  return <div className="relative aspect-video overflow-hidden rounded-2xl border border-cyan/25 bg-[#090f1c] shadow-[0_0_45px_rgba(83,229,255,.1)]">
    {stream ? <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-contain" /> : <div className="grid h-full place-items-center p-8 text-center"><div><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-cyan/30 bg-cyan/10 text-3xl text-cyan">⌁</div><p className="mb-2 text-sm font-semibold">Aucun flux détecté</p><p className="mb-6 text-xs text-white/40">Sélectionnez la fenêtre ou l’écran de votre jeu pour activer Ariane.</p><button onClick={startCapture} className="rounded-lg bg-cyan px-5 py-3 text-xs font-bold uppercase tracking-[.16em] text-ink transition hover:bg-white">Démarrer la capture</button></div></div>}
    <div className="pointer-events-none absolute inset-0 border-[1px] border-white/5" />
    {stream && <div className="absolute bottom-4 left-4 right-4 flex justify-between"><button onClick={captureFrame} disabled={isAnalyzing} className="rounded-lg border border-cyan/40 bg-ink/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan backdrop-blur transition hover:bg-cyan hover:text-ink disabled:opacity-50">{isAnalyzing ? "Analyse..." : "Analyser la frame"}</button><button onClick={stopCapture} className="rounded-lg border border-red-400/30 bg-ink/80 px-4 py-2 text-xs text-red-300 backdrop-blur hover:bg-red-400 hover:text-ink">Arrêter</button></div>}
    {error && <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-red-950/90 px-3 py-2 text-center text-xs text-red-200">{error}</p>}
  </div>;
}
