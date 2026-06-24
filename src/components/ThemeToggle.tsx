import { Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onToggle}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:text-zinc-100 dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all duration-300 cursor-pointer overflow-hidden header-icon"
      aria-label={t("theme.switch_to", { mode: theme === "light" ? t("theme.dark") : t("theme.light") })}
    >
      <Sun
        className={`size-[18px] absolute transition-all duration-500 ease-in-out ${
          theme === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />
      <Moon
        className={`size-[18px] absolute transition-all duration-500 ease-in-out ${
          theme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  );
}