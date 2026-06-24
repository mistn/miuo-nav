import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "navidash-bookmarks";
const WEBDAV_CONFIG_KEY = "navidash-webdav";
// 坚果云禁止在根目录直接写文件，必须放在子目录下
const REMOTE_FILE = "/NaviDash/miuo_nav_config.json";
const PROXY = "/api/webdav";

// Keys to include in sync/export (excludes webdav credentials)
const CONFIG_KEYS = [
  "navidash-bookmarks",
  "navidash-showWeather",
  "navidash-weatherLoc",
  "navidash-bg",
  "navidash-theme",
  "navidash-lang",
];

function collectConfig(): Record<string, unknown> {
  const cfg: Record<string, unknown> = {};
  for (const key of CONFIG_KEYS) {
    const val = localStorage.getItem(key);
    if (val !== null) {
      try { cfg[key] = JSON.parse(val); } catch { cfg[key] = val; }
    }
  }
  return cfg;
}

function restoreConfig(cfg: Record<string, unknown>): void {
  for (const key of CONFIG_KEYS) {
    if (key in cfg) {
      const val = cfg[key];
      localStorage.setItem(key, typeof val === "string" ? val : JSON.stringify(val));
    }
  }
}

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

async function webdavReq(server: string, auth: string, method: string, path: string, body?: string): Promise<{ status: number; body: string }> {
  const baseUrl = server.replace(/\/+$/, "");
  const url = path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  const res = await fetch(PROXY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, method, body: body || null, auth }),
  });
  const result = await res.json();
  return { status: result.status, body: typeof result.body === "string" ? result.body : String(result.body) };
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
      const auth = "Basic " + btoa(`${webdavConfig.username}:${webdavConfig.password}`);
      const data = JSON.stringify(collectConfig(), null, 2);
      const baseUrl = webdavConfig.server.replace(/\/+$/, "");
      const fullUrl = REMOTE_FILE.startsWith("/") ? `${baseUrl}${REMOTE_FILE}` : `${baseUrl}/${REMOTE_FILE}`;
      const result = await webdavReq(webdavConfig.server, auth, "PUT", REMOTE_FILE, data);
      if (result.status >= 400) throw new Error(`HTTP ${result.status}\n${fullUrl}\n${result.body}`);
      setSyncMsg("settings.pushed");
    } catch (e) {
      setSyncMsg(`settings.push_failed||${e instanceof Error ? e.message : "unknown"}`);
    } finally { setSyncing(false); }
  }, [webdavConfig]);

  const pullFromCloud = useCallback(async () => {
    if (!webdavConfig) { setSyncMsg("settings.no_webdav"); return; }
    setSyncing(true); setSyncMsg("");
    try {
      const auth = "Basic " + btoa(`${webdavConfig.username}:${webdavConfig.password}`);
      const baseUrl = webdavConfig.server.replace(/\/+$/, "");
      const fullUrl = REMOTE_FILE.startsWith("/") ? `${baseUrl}${REMOTE_FILE}` : `${baseUrl}/${REMOTE_FILE}`;
      const result = await webdavReq(webdavConfig.server, auth, "GET", REMOTE_FILE);
      if (result.status === 404) { setSyncMsg(`settings.no_remote||${fullUrl}`); setSyncing(false); return; }
      if (result.status >= 400) throw new Error(`HTTP ${result.status}\n${fullUrl}\n${result.body}`);
      const data = JSON.parse(result.body);
      restoreConfig(data);
      setBookmarks(loadBookmarks());
      setSyncMsg("settings.pulled");
      window.location.reload();
    } catch (e) {
      setSyncMsg(`settings.pull_failed||${e instanceof Error ? e.message : "unknown"}`);
    } finally { setSyncing(false); }
  }, [webdavConfig]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(collectConfig(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "miuo_nav_config.json"; a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        restoreConfig(data);
        setBookmarks(loadBookmarks());
        setSyncMsg("settings.imported");
        window.location.reload();
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