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
      className="relative flex items-center justify-center w-9 h-9 rounded-xl text-slate-900 [text-shadow:_0_1px_2px_rgb(255_255_255_/_80%)] dark:text-white dark:[text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)] hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all duration-300 cursor-pointer overflow-hidden header-icon"
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