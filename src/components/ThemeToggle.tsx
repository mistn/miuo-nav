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
      className="relative flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer overflow-hidden"
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