import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AddBookmarkDialogProps {
  onAdd: (bookmark: { label: string; href: string; icon: string; pinned?: boolean; category?: string }) => void;
}

const ICON_OPTIONS = [
  { value: "github", label: "icon_code" },
  { value: "globe", label: "icon_globe" },
  { value: "server", label: "icon_server" },
  { value: "drive", label: "icon_drive" },
  { value: "shield", label: "icon_shield" },
  { value: "box", label: "icon_box" },
];

export function AddBookmarkDialog({ onAdd }: AddBookmarkDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("globe");
  const [category, setCategory] = useState("");
  const [pinned, setPinned] = useState(true);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onAdd({
      label: name.trim(),
      href: url.trim(),
      icon,
      pinned,
      category: category.trim() || t("common.uncategorized"),
    });
    setName(""); setUrl(""); setIcon("globe"); setCategory(""); setPinned(true);
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
      <button onClick={() => setOpen(true)} className="group flex flex-col items-center gap-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm border border-dashed border-gray-200/80 dark:border-slate-700/80 transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
          <Plus className="size-5 text-gray-400 dark:text-gray-500" />
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 drop-shadow-sm">{t("common.add")}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transition-colors duration-300">
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("shortcuts.add_title")}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("shortcuts.add_description")}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("common.name")}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("shortcuts.my_app")} className="w-full h-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("common.url")}</label>
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t("shortcuts.url_placeholder")} className="w-full h-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("common.category")}</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t("common.uncategorized")} className="w-full h-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("common.icon")}</label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIcon(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        icon === opt.value
                          ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                          : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {t(`shortcuts.${opt.label}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="rounded" />
                  {t("common.pin")}
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 h-9 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">{t("common.cancel")}</button>
                <button type="submit" className="px-4 h-9 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer">{t("common.add")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}