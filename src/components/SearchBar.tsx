import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchEngine {
  id: string;
  label: string;
  domain: string;
  url: string;
}

const ENGINES: SearchEngine[] = [
  { id: "google", label: "", domain: "google.com", url: "https://www.google.com/search?q=" },
  { id: "duckduckgo", label: "", domain: "duckduckgo.com", url: "https://duckduckgo.com/?q=" },
  { id: "bing", label: "", domain: "bing.com", url: "https://www.bing.com/search?q=" },
  { id: "baidu", label: "", domain: "baidu.com", url: "https://www.baidu.com/s?wd=" },
  { id: "github", label: "", domain: "github.com", url: "https://github.com/search?q=" },
];

function getSavedEngine(): SearchEngine {
  const saved = localStorage.getItem("searchEngine");
  return ENGINES.find((e) => e.id === saved) ?? ENGINES[0];
}

export function SearchBar() {
  const { t } = useTranslation();
  const [engine, setEngine] = useState<SearchEngine>(getSavedEngine);
  const [query, setQuery] = useState("");

  const engines = ENGINES.map((e) => ({
    ...e,
    label: t(`search.engine_${e.id}`),
  }));

  useEffect(() => {
    localStorage.setItem("searchEngine", engine.id);
  }, [engine]);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    window.open(`${engine.url}${encodeURIComponent(query.trim())}`, "_blank");
    setQuery("");
  }, [query, engine]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>("[data-search-input]")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex items-center w-full max-w-[95vw] sm:max-w-2xl rounded-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm dark:bg-black/60 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:shadow-none px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-300">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="flex w-10 shrink-0 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0">
            <img
              src={`https://www.google.com/s2/favicons?domain=${engine.domain}&sz=64`}
              alt={engine.label}
              className="w-5 h-5 rounded-full"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={6} className="min-w-[160px] rounded-xl">
          {engines.map((eng) => (
            <DropdownMenuItem
              key={eng.id}
              onClick={() => setEngine(eng)}
              className="rounded-lg cursor-pointer"
            >
              <img
                src={`https://www.google.com/s2/favicons?domain=${eng.domain}&sz=64`}
                alt={eng.label}
                className="w-5 h-5 rounded-full mr-2"
              />
              {eng.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        data-search-input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder={t("search.placeholder")}
        className="flex-1 min-w-0 bg-transparent border-none shadow-none text-base text-slate-800 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />

      <button onClick={handleSearch} className="flex shrink-0 items-center justify-center text-slate-800 dark:text-zinc-100 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none">
        <Search className="size-5" />
      </button>
    </div>
  );
}