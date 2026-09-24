"use client";

import { useEffect, useState } from "react";
import ScreenCapture from "./ScreenCapture";
import VoiceAssistant from "./VoiceAssistant";

type Analysis = {
  gameName: string;
  context: string;
  quickTips: string[];
};

const initialAnalysis: Analysis = {
  gameName: "Elden Ring",
  context: "Veille tactique · Prêt à analyser votre partie",
  quickTips: ["Partagez votre fenêtre de jeu pour commencer.", "Ariane surveillera les changements importants."]
};

export default function GameAssistant() {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [messages, setMessages] = useState([{ role: "ariane", text: "Systèmes en ligne. Partagez votre écran et je vous guide." }]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [keyStatus, setKeyStatus] = useState("Clé non configurée");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.electronAPI) {
      window.electronAPI.getApiKey().then((key) => {
        if (key) {
          setApiKey(key);
          setKeyStatus("Clé enregistrée localement");
        }
      });
    }
  }, []);

  async function analyzeFrame(image: string) {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(apiKey ? { "x-openai-key": apiKey } : {}) },
        body: JSON.stringify({ image })
      });
      if (!response.ok) throw new Error("Analyse indisponible");
      const nextAnalysis = (await response.json()) as Analysis;
      setAnalysis(nextAnalysis);
      setMessages((current) => [...current, { role: "ariane", text: `Analyse terminée : ${nextAnalysis.context}` }]);
    } catch {
      setMessages((current) => [...current, { role: "ariane", text: "Je n’ai pas pu analyser cette image. Réessayez dans un instant." }]);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function askAriane(question: string) {
    setMessages((current) => [...current, { role: "user", text: question }, { role: "ariane", text: "Je consulte votre flux tactique. Capturez une frame pour une réponse contextualisée." }]);
  }

  async function saveKey() {
    if (!apiKey.startsWith("sk-")) {
      setKeyStatus("La clé doit commencer par sk-");
      return;
    }
    if (window.electronAPI) {
      await window.electronAPI.saveApiKey(apiKey);
      setKeyStatus("Clé chiffrée et enregistrée sur cet ordinateur");
    } else {
      setKeyStatus("Mode navigateur : utilisez OPENAI_API_KEY côté serveur");
    }
  }

  async function removeKey() {
    await window.electronAPI?.deleteApiKey();
    setApiKey("");
    setKeyStatus("Clé supprimée");
  }

  return (
    <main className="grid-bg min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-[1500px] items-center justify-between border-b border-white/10 px-5 py-5 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="pulse-ring flex h-10 w-10 items-center justify-center rounded-xl border border-cyan/50 bg-cyan/10 text-xl text-cyan shadow-neon">✦</div>
          <div><p className="text-xs font-bold tracking-[.35em] text-cyan">ARIANE // GAMING</p><h1 className="text-lg font-semibold tracking-wide">ARIANE <span className="text-white/40">AI</span></h1></div>
        </div>
        <div className="flex items-center gap-4"><button onClick={() => setShowSettings((value) => !value)} className="rounded-lg border border-white/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-white/60 hover:border-cyan/50 hover:text-cyan">Configuration</button><div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-emerald-300 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" /> Systems operational</div></div>
      </header>

      {showSettings && <section className="mx-auto max-w-[1500px] px-5 pt-5 lg:px-10"><div className="rounded-2xl border border-cyan/20 bg-panel/90 p-5 shadow-neon"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[.2em] text-cyan">Configuration locale</p><h2 className="mt-1 text-lg font-semibold">Clé API OpenAI</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-white/50">Dans l’application Windows, votre clé est chiffrée par Windows et reste sur cet ordinateur. Ne la publiez jamais sur GitHub.</p></div><span className="text-xs text-white/50">{keyStatus}</span></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={apiKey} onChange={(event) => setApiKey(event.target.value)} type="password" placeholder="sk-..." className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-cyan/60" /><button onClick={saveKey} className="rounded-lg bg-cyan px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink hover:bg-white">Enregistrer</button><button onClick={removeKey} className="rounded-lg border border-red-400/30 px-5 py-3 text-xs font-bold uppercase tracking-wider text-red-300 hover:bg-red-400 hover:text-ink">Supprimer</button></div></div></section>}
      <div className="mx-auto grid max-w-[1500px] gap-5 p-5 lg:grid-cols-[1fr_360px] lg:p-10">
        <section className="space-y-5">
          <div className="flex items-end justify-between"><div><p className="mb-2 text-xs uppercase tracking-[.25em] text-cyan/70">Live tactical feed</p><h2 className="text-2xl font-semibold">Votre espace de jeu</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">{isAnalyzing ? "ANALYZING..." : "READY"}</span></div>
          <ScreenCapture onAnalyze={analyzeFrame} isAnalyzing={isAnalyzing} />
          <div className="grid gap-4 sm:grid-cols-2">
            <StatusCard label="Jeu détecté" value={analysis.gameName} icon="◈" accent="cyan" />
            <StatusCard label="Contexte actuel" value={analysis.context} icon="⌁" accent="violet" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-neon">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-semibold uppercase tracking-[.18em]">Quick tips</h3><span className="text-xs text-cyan">AI GENERATED</span></div>
            <div className="grid gap-3 md:grid-cols-2">{analysis.quickTips.map((tip, index) => <div key={tip} className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-sm text-white/75"><span className="mr-3 text-cyan">0{index + 1}</span>{tip}</div>)}</div>
          </div>
        </section>

        <aside className="flex min-h-[620px] flex-col rounded-2xl border border-white/10 bg-panel/80 shadow-neon">
          <div className="flex items-center justify-between border-b border-white/10 p-5"><div><p className="text-xs uppercase tracking-[.2em] text-white/40">Tactical channel</p><h2 className="mt-1 text-lg font-semibold">Ariane</h2></div><VoiceAssistant onQuestion={askAriane} /></div>
          <div className="scanlines flex-1 space-y-4 overflow-auto p-5">{messages.map((message, index) => <div key={`${message.text}-${index}`} className={message.role === "user" ? "ml-8 text-right" : ""}><span className="mb-1 block text-[10px] uppercase tracking-[.2em] text-cyan/60">{message.role === "user" ? "You" : "Ariane"}</span><p className={`inline-block rounded-xl border px-4 py-3 text-sm leading-6 ${message.role === "user" ? "border-violet/30 bg-violet/10 text-white/80" : "border-cyan/15 bg-cyan/[.04] text-white/70"}`}>{message.text}</p></div>)}</div>
          <div className="border-t border-white/10 p-4"><p className="mb-3 text-[10px] uppercase tracking-[.2em] text-white/35">Voice control active</p><div className="flex items-center gap-2 text-xs text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Say “Ariane” or press the microphone</div></div>
        </aside>
      </div>
    </main>
  );
}

function StatusCard({ label, value, icon, accent }: { label: string; value: string; icon: string; accent: "cyan" | "violet" }) {
  return <div className="rounded-2xl border border-white/10 bg-panel/80 p-5"><div className={`mb-4 text-xl ${accent === "cyan" ? "text-cyan" : "text-violet"}`}>{icon}</div><p className="text-[10px] uppercase tracking-[.2em] text-white/40">{label}</p><p className="mt-2 truncate text-sm text-white/85">{value}</p></div>;
}
