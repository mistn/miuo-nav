import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en";
import zh from "./zh";

function detectLanguage(): string {
  const saved = localStorage.getItem("navidash-lang");
  if (saved) return saved;
  const browserLang = navigator.language || (navigator as any).userLanguage || "";
  const detected = browserLang.startsWith("zh") ? "zh" : "en";
  localStorage.setItem("navidash-lang", detected);
  return detected;
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, zh: { translation: zh } },
  lng: detectLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
