"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LanguageCode } from "@/lib/ai/types";

const LANG_BCP47: Record<LanguageCode, string> = {
  en: "en-US",
  ur: "ur-PK",
  ar: "ar-SA",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  hi: "hi-IN",
  zh: "zh-CN",
};

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, language: LanguageCode = "en") => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const clean = text.replace(/[#*$`[\]]/g, " ").replace(/\s+/g, " ").slice(0, 600);
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = LANG_BCP47[language] ?? "en-US";
      u.rate = 0.98;
      u.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang.replace("_", "-").toLowerCase().startsWith(LANG_BCP47[language].toLowerCase().slice(0, 2)));
      if (match) u.voice = match;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      utterance.current = u;
      window.speechSynthesis.speak(u);
      setSpeaking(true);
    },
    [],
  );

  useEffect(() => stop, [stop]);

  return { supported, speaking, speak, stop };
}
