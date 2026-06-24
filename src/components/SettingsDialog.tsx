import { useState, useRef, useEffect, useCallback } from "react";
import { Cloud, Download, Upload, Loader2, Settings, X, Languages, Eye, EyeOff, Image as ImageIcon, Link, FileUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { WebDAVConfig } from "@/hooks/useSyncManager";
import type { BgConfig } from "@/hooks/useBackground";
import type { WeatherLocation } from "@/App";

interface SettingsDialogProps {
  webdavConfig: WebDAVConfig | null;
  onSaveWebDAV: (config: WebDAVConfig) => void;
  onPush: () => void;
  onPull: () => void;
  syncing: boolean;
  syncMsg: string;
  onExport: () => void;
  onImport: (file: File) => void;
  showWeather: boolean;
  onToggleWeather: () => void;
  weatherLoc: WeatherLocation;
  onUpdateWeatherLoc: (loc: WeatherLocation) => void;
  bgConfig: BgConfig;
  onUpdateBg: (patch: Partial<BgConfig>) => void;
  onUploadBg: (file: File) => void;
}

function CitySearch({ apiKey, city, cityCode, onUpdate }: {
  apiKey: string; city: string; cityCode: string;
  onUpdate: (loc: WeatherLocation) => void;
}) {
  const { t } = useTranslation();
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null!);

  const lookup = useCallback(async (name: string) => {
    if (!apiKey || !name.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/amap/config/district?keywords=${encodeURIComponent(name)}&subdistrict=0&key=${apiKey}`);
      const data = await res.json();
      if (data.status === "1" && data.districts?.[0]?.adcode) {
        onUpdate({ apiKey, city: name, cityCode: data.districts[0].adcode });
      }
    } catch { /* silent */ }
    setSearching(false);
  }, [apiKey, onUpdate]);

  const handleCityChange = (val: string) => {
    onUpdate({ apiKey, city: val, cityCode });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => lookup(val), 600);
  };

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">{t("settings.weather_city")}</label>
        <input value={city} onChange={(e) => handleCityChange(e.target.value)}
          placeholder="例如 Shanghai 或 上海"
          className="w-full h-8 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-ring mt-1"
        />
      </div>
      <div className="flex-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">City Code</label>
        <div className="flex items-center gap-1 mt-1">
          <input value={cityCode} readOnly
            className="flex-1 h-8 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 px-2 text-xs text-gray-500 dark:text-gray-400 outline-none"
          />
          {searching && <Loader2 className="size-3 animate-spin text-gray-400 shrink-0" />}
        </div>
      </div>
    </div>
  );
}

function translateMsg(t: (key: string, opts?: Record<string, string>) => string, msg: string): string {
  const sep = msg.indexOf("||");
  if (sep !== -1) {
    const key = msg.slice(0, sep);
    const val = msg.slice(sep + 2);
    return t(key, { msg: val });
  }
  return t(msg);
}

export function SettingsDialog({
  webdavConfig, onSaveWebDAV,
  onPush, onPull, syncing, syncMsg, onExport, onImport,
  showWeather, onToggleWeather,
  weatherLoc, onUpdateWeatherLoc,
  bgConfig, onUpdateBg, onUploadBg,
}: SettingsDialogProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"webdav" | "local" | "prefs">("webdav");
  const [server, setServer] = useState(webdavConfig?.server ?? "");
  const [username, setUsername] = useState(webdavConfig?.username ?? "");
  const [password, setPassword] = useState(webdavConfig?.password ?? "");
  const fileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSaveWebDAV({ server: server.trim(), username: username.trim(), password });
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
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label={t("settings.title")}
      >
        <Settings className="size-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transition-colors duration-300">
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("settings.title")}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.description")}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="px-6">
              <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setTab("webdav")}
                  className={`flex-1 py-1.5 text-sm rounded-md transition-all cursor-pointer ${
                    tab === "webdav" ? "bg-white dark:bg-slate-700 shadow-sm font-medium text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {t("settings.webdav_sync")}
                </button>
                <button
                  onClick={() => setTab("local")}
                  className={`flex-1 py-1.5 text-sm rounded-md transition-all cursor-pointer ${
                    tab === "local" ? "bg-white dark:bg-slate-700 shadow-sm font-medium text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {t("settings.local_export")}
                </button>
                <button
                  onClick={() => setTab("prefs")}
                  className={`flex-1 py-1.5 text-sm rounded-md transition-all cursor-pointer ${
                    tab === "prefs" ? "bg-white dark:bg-slate-700 shadow-sm font-medium text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {t("settings.preferences")}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {tab === "webdav" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("settings.server_url")}</label>
                    <input value={server} onChange={(e) => setServer(e.target.value)} placeholder={t("settings.server_placeholder")} className="w-full h-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("settings.username")}</label>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t("settings.username_placeholder")} className="w-full h-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("settings.password")}</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" className="w-full h-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <button onClick={handleSave} className="w-full h-9 rounded-xl border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">{t("settings.save_credentials")}</button>
                  <div className="flex gap-2">
                    <button onClick={onPull} disabled={syncing} className="flex-1 h-9 rounded-xl bg-gray-900 dark:bg-slate-600 text-white text-sm hover:bg-gray-800 dark:hover:bg-slate-500 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1">
                      {syncing ? <Loader2 className="size-4 animate-spin" /> : <Cloud className="size-4" />}
                      {t("settings.pull")}
                    </button>
                    <button onClick={onPush} disabled={syncing} className="flex-1 h-9 rounded-xl bg-gray-900 dark:bg-slate-600 text-white text-sm hover:bg-gray-800 dark:hover:bg-slate-500 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1">
                      {syncing ? <Loader2 className="size-4 animate-spin" /> : <Cloud className="size-4" />}
                      {t("settings.push")}
                    </button>
                  </div>
                  {syncMsg && <p className="text-xs text-center text-gray-500 dark:text-gray-400">{translateMsg(t, syncMsg)}</p>}
                </>
              ) : tab === "local" ? (
                <>
                  <button onClick={onExport} className="w-full h-9 rounded-xl border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1">
                    <Download className="size-4" /> {t("settings.export_json")}
                  </button>
                  <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); }} />
                  <button onClick={() => fileRef.current?.click()} className="w-full h-9 rounded-xl border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1">
                    <Upload className="size-4" /> {t("settings.import_json")}
                  </button>
                  {syncMsg && <p className="text-xs text-center text-gray-500 dark:text-gray-400">{translateMsg(t, syncMsg)}</p>}
                </>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Languages className="size-4 text-gray-400" />
                      <span>Language / 语言</span>
                    </div>
                    <button
                      onClick={() => {
                        const next = i18n.language === "zh" ? "en" : "zh";
                        i18n.changeLanguage(next);
                        localStorage.setItem("navidash-lang", next);
                      }}
                      className="px-3 h-8 rounded-lg text-xs font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      {i18n.language === "zh" ? "English" : "中文"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      {showWeather ? <Eye className="size-4 text-gray-400" /> : <EyeOff className="size-4 text-gray-400" />}
                      <span>{t("settings.weather")}</span>
                    </div>
                    <button
                      onClick={onToggleWeather}
                      className={`px-3 h-8 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        showWeather
                          ? "border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                          : "border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      }`}
                    >
                      {showWeather ? "Hide" : "Show"}
                    </button>
                  </div>
                  {showWeather && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">API Key</label>
                        <input value={weatherLoc.apiKey} onChange={(e) => onUpdateWeatherLoc({ ...weatherLoc, apiKey: e.target.value })} placeholder="高德开放平台 → 应用管理 → Key" className="w-full h-8 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-ring mt-1" />
                      </div>
                      <CitySearch
                        apiKey={weatherLoc.apiKey}
                        city={weatherLoc.city}
                        cityCode={weatherLoc.cityCode}
                        onUpdate={onUpdateWeatherLoc}
                      />
                    </div>
                  )}

                  <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-3">
                      <ImageIcon className="size-4 text-gray-400" />
                      <span>{t("settings.background")}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onUpdateBg({ enabled: false })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          !bgConfig.enabled
                            ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
                            : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        {t("settings.bg_disable")}
                      </button>
                      <button
                        onClick={() => onUpdateBg({ enabled: true, type: "bing" })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          bgConfig.enabled && bgConfig.type === "bing"
                            ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
                            : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        <Link className="size-3 inline mr-1" />{t("settings.bg_bing")}
                      </button>
                      <button
                        onClick={() => onUpdateBg({ enabled: true, type: "custom" })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          bgConfig.enabled && bgConfig.type === "custom"
                            ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
                            : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        <Link className="size-3 inline mr-1" />{t("settings.bg_custom")}
                      </button>
                      <button
                        onClick={() => bgFileRef.current?.click()}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          bgConfig.enabled && bgConfig.type === "upload"
                            ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
                            : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        <FileUp className="size-3 inline mr-1" />{t("settings.bg_upload")}
                      </button>
                    </div>
                    {bgConfig.enabled && bgConfig.type === "custom" && (
                      <input
                        value={bgConfig.customUrl}
                        onChange={(e) => onUpdateBg({ customUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="mt-2 w-full h-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-ring"
                      />
                    )}
                    <input
                      ref={bgFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUploadBg(f);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}