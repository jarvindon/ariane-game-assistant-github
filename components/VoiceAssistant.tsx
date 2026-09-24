"use client";

import { useRef, useState } from "react";

type Recognition = { lang: string; start: () => void; stop: () => void; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: (() => void) | null };

export default function VoiceAssistant({ onQuestion }: { onQuestion: (question: string) => void }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<Recognition | null>(null);

  function toggleListening() {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SpeechRecognition = (window as Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }).SpeechRecognition
      ?? (window as Window & { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) { onQuestion("La reconnaissance vocale n’est pas supportée par ce navigateur."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.onresult = (event) => { const text = event.results[0][0].transcript; onQuestion(text); window.speechSynthesis?.speak(new SpeechSynthesisUtterance("Je vous écoute.")); setListening(false); };
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  return <button onClick={toggleListening} aria-label={listening ? "Arrêter le microphone" : "Activer le microphone"} className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition ${listening ? "border-cyan bg-cyan/20 text-cyan shadow-neon" : "border-white/15 bg-white/[.03] text-white/60 hover:border-cyan/50 hover:text-cyan"}`}>{listening ? "◉" : "♩"}</button>;
}
