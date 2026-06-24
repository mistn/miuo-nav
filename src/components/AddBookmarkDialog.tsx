import { useState, useEffect } from "react";
import { Plus, X, Code2, Globe, Server, HardDrive, ShieldCheck, Box } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AddBookmarkDialogProps {
  onAdd: (bookmark: { label: string; href: string; icon: string; pinned?: boolean; category?: string }) => void;
}

const ICON_OPTIONS = [
  { value: "github", icon: Code2 },
  { value: "globe", icon: Globe },
  { value: "server", icon: Server },
  { value: "drive", icon: HardDrive },
  { value: "shield", icon: ShieldCheck },
  { value: "box", icon: Box },
];

function normalizeUrl(url: string): string {
  const s = url.trim();
  if (!s) return s;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//i, "");
}

export function AddBookmarkDialog({ onAdd }: AddBookmarkDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [category, setCategory] = useState("");
  const [pinned, setPinned] = useState(true);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAdd({
      label: name.trim() || stripProtocol(normalizeUrl(url)),
      href: normalizeUrl(url),
      icon,
      pinned,
      category: category.trim() || t("common.uncategorized"),
    });
    setName(""); setUrl(""); setIcon(""); setCategory(""); setPinned(true);
    setOpen(false);
  };

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
      {/* 严格基线对齐：与 ShortcutsGrid 每项完全相同的 wrapper 结构 */}
      <button onClick={() => setOpen(true)} className="group flex flex-col items-center justify-start w-[72px] gap-1">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-dashed border-slate-300 shadow-none dark:bg-zinc-950 dark:border dark:border-dashed dark:border-zinc-700 dark:shadow-none transition-all duration-200 group-hover:scale-105 dark:group-hover:bg-zinc-800">
          <Plus className="size-5 text-slate-900 dark:text-white font-medium" />
        </div>
        {/* 严格基线对齐：固定宽度、统一 gap、fixed leading-tight */}
        <span className="text-xs text-slate-900 dark:text-white font-semibold tracking-wide leading-tight text-center w-full">{t("common.add")}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transition-colors duration-300 border dark:border-white/10">
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t("shortcuts.add_title")}</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{t("shortcuts.add_description")}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t("common.name")}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("shortcuts.my_app")} className="w-full h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t("common.url")}</label>
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t("shortcuts.url_placeholder")} className="w-full h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t("common.category")}</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t("common.uncategorized")} className="w-full h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t("common.icon")}</label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIcon(opt.value)}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
                        icon === opt.value
                          ? "bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                          : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-white/10"
                      }`}
                    >
                      <opt.icon className="size-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300 cursor-pointer">
                  <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="rounded" />
                  {t("common.pin")}
                </label>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder={t("shortcuts.custom_icon")} className="flex-1 h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-ring" />
                <button type="button" onClick={() => setOpen(false)} className="px-4 h-9 rounded-xl text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer">{t("common.cancel")}</button>
                <button type="submit" className="px-4 h-9 rounded-xl bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer">{t("common.add")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}