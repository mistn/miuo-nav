import { useState, useEffect, useCallback } from "react";
import { createClient, type WebDAVClient } from "webdav";

const STORAGE_KEY = "navidash-bookmarks";
const WEBDAV_CONFIG_KEY = "navidash-webdav";
const REMOTE_FILE = "/miuo_nav_config.json";

export interface Bookmark {
  id: string;
  label: string;
  href: string;
  icon: string;
  pinned?: boolean;

  category?: string;
}

export interface WebDAVConfig {
  server: string;
  username: string;
  password: string;
}

const DEFAULTS: Bookmark[] = [
  { id: "github", label: "GitHub", href: "https://github.com", icon: "github", pinned: true, category: "DevTools" },
  { id: "vercel", label: "Vercel", href: "https://vercel.com", icon: "globe", pinned: true, category: "DevTools" },
];

function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
    return DEFAULTS;
  } catch { return DEFAULTS; }
}

function saveBookmarks(bookmarks: Bookmark[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

function loadWebDAVConfig(): WebDAVConfig | null {
  try {
    const raw = localStorage.getItem(WEBDAV_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveWebDAVConfig(config: WebDAVConfig) {
  localStorage.setItem(WEBDAV_CONFIG_KEY, JSON.stringify(config));
}

function getClient(config: WebDAVConfig): WebDAVClient {
  return createClient(config.server, { username: config.username, password: config.password });
}

export function useSyncManager() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks);
  const [webdavConfig, setWebdavConfigState] = useState<WebDAVConfig | null>(loadWebDAVConfig);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => { saveBookmarks(bookmarks); }, [bookmarks]);

  const addBookmark = useCallback((b: Omit<Bookmark, "id">) => {
    setBookmarks((prev) => [...prev, { ...b, id: Date.now().toString() }]);
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const updateBookmark = useCallback((id: string, data: Omit<Bookmark, "id">) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.id === id);
      if (exists) return prev.map((b) => (b.id === id ? { ...b, ...data } : b));
      return [...prev, { ...data, id }];
    });
  }, []);

  const moveBookmark = useCallback((dragId: string, targetId: string) => {
    setBookmarks((prev) => {
      const dragIdx = prev.findIndex((b) => b.id === dragId);
      const targetIdx = prev.findIndex((b) => b.id === targetId);
      if (dragIdx === -1 || targetIdx === -1 || dragIdx === targetIdx) return prev;
      const copy = [...prev];
      const [item] = copy.splice(dragIdx, 1);
      const newTargetIdx = copy.findIndex((b) => b.id === targetId);
      copy.splice(newTargetIdx, 0, item);
      return copy;
    });
  }, []);

  const setWebDAVConfig = useCallback((config: WebDAVConfig) => {
    saveWebDAVConfig(config);
    setWebdavConfigState(config);
  }, []);

  const pushToCloud = useCallback(async () => {
    if (!webdavConfig) { setSyncMsg("settings.no_webdav"); return; }
    setSyncing(true); setSyncMsg("");
    try {
      const client = getClient(webdavConfig);
      const data = JSON.stringify(bookmarks, null, 2);
      await client.putFileContents(REMOTE_FILE, data, { overwrite: true });
      setSyncMsg("settings.pushed");
    } catch (e) {
      setSyncMsg(`settings.push_failed||${e instanceof Error ? e.message : "unknown"}`);
    } finally { setSyncing(false); }
  }, [webdavConfig, bookmarks]);

  const pullFromCloud = useCallback(async () => {
    if (!webdavConfig) { setSyncMsg("settings.no_webdav"); return; }
    setSyncing(true); setSyncMsg("");
    try {
      const client = getClient(webdavConfig);
      const exists = await client.exists(REMOTE_FILE);
      if (!exists) { setSyncMsg("settings.no_remote"); setSyncing(false); return; }
      const content = await client.getFileContents(REMOTE_FILE, { format: "text" }) as string;
      const parsed = JSON.parse(content) as Bookmark[];
      setBookmarks(parsed);
      setSyncMsg("settings.pulled");
    } catch (e) {
      setSyncMsg(`settings.pull_failed||${e instanceof Error ? e.message : "unknown"}`);
    } finally { setSyncing(false); }
  }, [webdavConfig]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(bookmarks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "miuo_nav_config.json"; a.click();
    URL.revokeObjectURL(url);
  }, [bookmarks]);

  const importJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as Bookmark[];
        setBookmarks(parsed);
        setSyncMsg("settings.imported");
      } catch { setSyncMsg("settings.invalid_json"); }
    };
    reader.readAsText(file);
  }, []);

  return {
    bookmarks, setBookmarks,
    addBookmark, removeBookmark, updateBookmark, moveBookmark,
    webdavConfig, setWebDAVConfig,
    syncing, syncMsg,
    pushToCloud, pullFromCloud,
    exportJSON, importJSON,
  };
}