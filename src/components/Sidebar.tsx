import { useState, useEffect } from "react";
import {
  Code2, Globe, Server, HardDrive, ShieldCheck, Box, Menu, X, Trash2, type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Bookmark } from "@/hooks/useSyncManager";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ICON_MAP: Record<string, LucideIcon> = {
  github: Code2, globe: Globe, server: Server, drive: HardDrive, shield: ShieldCheck, box: Box,
};

function getDomain(href: string): string | null {
  try { return new URL(href).hostname; } catch { return null; }
}

interface SidebarProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => void;
}

function groupByCategory(bookmarks: Bookmark[]): Record<string, Bookmark[]> {
  return bookmarks.reduce((groups, bookmark) => {
    const cat = bookmark.category || "Uncategorized";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(bookmark);
    return groups;
  }, {} as Record<string, Bookmark[]>);
}

export function Sidebar({ bookmarks, onDelete }: SidebarProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const visible = bookmarks;

  const grouped = groupByCategory(visible);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-400 hover:text-slate-600 dark:hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        aria-label={t("sidebar.open")}
      >
        <Menu className="size-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85vw] sm:w-80 bg-white dark:bg-zinc-950 shadow-xl flex flex-col transition-colors duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-zinc-100">{t("sidebar.title")}</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  {t("sidebar.shortcuts_count", {
                    count: visible.length,
                    categories: Object.keys(grouped).length,
                  })}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
        className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-400 hover:text-slate-600 dark:hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer header-icon"
                aria-label={t("sidebar.close")}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <Accordion type="multiple" className="w-full">
                {Object.entries(grouped).map(([category, items]) => (
                  <AccordionItem key={category} value={category} className="border-b border-gray-100 dark:border-white/10">
                    <AccordionTrigger className="text-sm font-medium text-gray-700 dark:text-zinc-300 py-3 hover:no-underline">
                      <span>{category} <span className="text-gray-400 dark:text-zinc-500 font-normal">({items.length})</span></span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 gap-3">
                        {items.map((item) => {
                          const domain = getDomain(item.href);
                          const Icon = ICON_MAP[item.icon] ?? Globe;
                          return (
                            <div key={item.id} className="relative group">
                              <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-colors"
                              >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                  {domain ? (
                                    <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" className="w-5 h-5 rounded-full" />
                                  ) : (
                                    <Icon className="size-4 text-gray-600 dark:text-zinc-400" />
                                  )}
                                </div>
                                <span className="text-xs text-gray-600 dark:text-zinc-400 text-center leading-tight">{item.label}</span>
                              </a>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  onDelete(item.id);
                                }}
                                className="absolute top-1 right-1 p-1 rounded-md bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50"
                                title={t("sidebar.delete")}
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      )}
    </>
  );
}