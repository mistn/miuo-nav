import { useState, useEffect, useRef } from "react";
import {
  Code2, Globe, Server, HardDrive, ShieldCheck, Box, Pencil, Trash2, X, type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AddBookmarkDialog } from "@/components/AddBookmarkDialog";
import type { Bookmark } from "@/hooks/useSyncManager";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const ICON_MAP: Record<string, LucideIcon> = {
  github: Code2, globe: Globe, server: Server, drive: HardDrive, shield: ShieldCheck, box: Box,
};

const ICON_OPTIONS = [
  { value: "github", icon: Code2 },
  { value: "globe", icon: Globe },
  { value: "server", icon: Server },
  { value: "drive", icon: HardDrive },
  { value: "shield", icon: ShieldCheck },
  { value: "box", icon: Box },
];

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//i, "");
}

function getDomain(href: string): string | null {
  try { return new URL(href).hostname; } catch { return null; }
}

function normalizeUrl(url: string): string {
  const s = url.trim();
  if (!s) return s;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

interface EditDialogProps {
  bookmark: Bookmark | null;
  onSave: (id: string, data: Omit<Bookmark, "id">) => void;
  onClose: () => void;
}

function EditBookmarkDialog({ bookmark, onSave, onClose }: EditDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(bookmark?.label ?? "");
  const [url, setUrl] = useState(bookmark?.href ?? "");
  const [icon, setIcon] = useState(bookmark?.icon ?? "");
  const [category, setCategory] = useState(bookmark?.category ?? "");
  const [pinned, setPinned] = useState(bookmark?.pinned ?? true);
  useEffect(() => {
    if (bookmark) {
      setName(bookmark.label);
      setUrl(bookmark.href);
      setIcon(bookmark.icon);
      setCategory(bookmark.category ?? "");
      setPinned(bookmark.pinned ?? true);
    }
  }, [bookmark]);

  if (!bookmark) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSave(bookmark.id, {
      label: name.trim() || stripProtocol(normalizeUrl(url)),
      href: normalizeUrl(url),
      icon,
      pinned,
      category: category.trim() || t("common.uncategorized"),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transition-colors duration-300 border dark:border-white/10">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t("shortcuts.edit_title")}</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">{t("shortcuts.edit_description")}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t("common.name")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t("common.url")}</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t("common.category")}</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t("common.uncategorized")} className="w-full h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t("common.icon")}</label>
            <div className="flex gap-2 flex-wrap">
              {ICON_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setIcon(opt.value)} className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${icon === opt.value ? "bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900" : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-white/10"}`}>
                  <opt.icon className="size-4" />
                </button>
              ))}
            </div>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder={t("shortcuts.custom_icon")} className="w-full h-8 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 text-xs text-gray-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-ring mt-1" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300 cursor-pointer">
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="rounded" />
              {t("common.pin")}
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 h-9 rounded-xl text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer">{t("common.cancel")}</button>
            <button type="submit" className="px-4 h-9 rounded-xl bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer">{t("common.save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ShortcutsGridProps {
  bookmarks: Bookmark[];
  onAdd: (b: Omit<Bookmark, "id">) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, data: Omit<Bookmark, "id">) => void;
  onMove: (dragId: string, targetId: string) => void;
}

export function ShortcutsGrid({ bookmarks, onAdd, onRemove, onUpdate, onMove }: ShortcutsGridProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<Bookmark | null>(null);
  const dragId = useRef<string | null>(null);

  const visible = bookmarks.filter((b) => b.pinned).slice(0, 8);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 sm:mt-12">
        {visible.map((item) => {
          const domain = getDomain(item.href);
          const Icon = ICON_MAP[item.icon] ?? Globe;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => { dragId.current = item.id; }}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={() => {
                if (dragId.current && dragId.current !== item.id) {
                  onMove(dragId.current, item.id);
                }
                dragId.current = null;
              }}
              className="flex flex-col items-center gap-2"
            >
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* 高 tint 玻璃拟态：黑底/白边保证暗色模式下图标与背景充分分离，text-slate-800/zinc-100 无需阴影即可清晰阅读 */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm dark:bg-black/60 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:shadow-none transition-all duration-200 hover:shadow-md hover:scale-105 dark:hover:bg-white/20 cursor-pointer">
                      {domain ? (
                        <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" className="w-5 h-5 rounded-full" />
                      ) : (
                        <Icon className="size-5 text-gray-600 dark:text-white" />
                      )}
                    </div>
                  </a>
                </ContextMenuTrigger>
                {/* 高 tint 玻璃本身已提供足够对比度，文字无需额外阴影，保持清晰锐利 */}
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-800 font-medium dark:text-zinc-100 text-center mt-2 shortcut-label"
                >
                  {item.label}
                </a>

                <ContextMenuContent className="w-48 rounded-xl">
                  <ContextMenuItem className="rounded-lg cursor-pointer" onClick={() => setEditing(item)}>
                    <Pencil className="size-4 mr-2" />
                    {t("common.edit")}
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    variant="destructive"
                    className="rounded-lg cursor-pointer"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 className="size-4 mr-2" />
                    {t("common.delete")}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          );
        })}
        <AddBookmarkDialog onAdd={onAdd} />
      </div>

      <EditBookmarkDialog
        bookmark={editing}
        onSave={onUpdate}
        onClose={() => setEditing(null)}
      />
    </>
  );
}