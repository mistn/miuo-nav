import { useState, useEffect, useCallback } from "react";
import { SearchBar } from "@/components/SearchBar";
import { WeatherWidget } from "@/components/WeatherWidget";
import { TimeWidget } from "@/components/TimeWidget";
import { ShortcutsGrid } from "@/components/ShortcutsGrid";
import { Sidebar } from "@/components/Sidebar";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BackgroundLayer } from "@/components/BackgroundLayer";
import { useSyncManager } from "@/hooks/useSyncManager";
import { useTheme } from "@/hooks/useTheme";
import { useBackground } from "@/hooks/useBackground";

export interface WeatherLocation {
  apiKey: string;
  cityCode: string;
  city: string;
}

const DEFAULT_WEATHER: WeatherLocation = { apiKey: "", cityCode: "310000", city: "Shanghai" };

function loadWeatherLocation(): WeatherLocation {
  try {
    const raw = localStorage.getItem("navidash-weatherLoc");
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_WEATHER;
}

function AppContent() {
  const [showWeather, setShowWeather] = useState(() => {
    const saved = localStorage.getItem("navidash-showWeather");
    return saved === null ? true : saved === "true";
  });
  const [weatherLoc, setWeatherLoc] = useState<WeatherLocation>(loadWeatherLocation);
  const { theme, toggleTheme } = useTheme();
  const { config: bgConfig, updateConfig: onUpdateBg, bgUrl, handleUpload: onUploadBg } = useBackground();

  const {
    bookmarks, setBookmarks,
    addBookmark, removeBookmark, updateBookmark, moveBookmark,
    webdavConfig, setWebDAVConfig,
    syncing, syncMsg,
    pushToCloud, pullFromCloud,
    exportJSON, importJSON,
  } = useSyncManager();

  const handleDelete = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, [setBookmarks]);

  useEffect(() => {
    localStorage.setItem("navidash-showWeather", String(showWeather));
  }, [showWeather]);

  useEffect(() => {
    localStorage.setItem("navidash-weatherLoc", JSON.stringify(weatherLoc));
  }, [weatherLoc]);

  const bgActive = bgConfig.enabled && bgUrl;

  return (
    <div className="relative min-h-screen">
      <BackgroundLayer url={bgUrl} enabled={bgConfig.enabled} />
      <div className={`relative z-10 flex flex-col min-h-screen transition-colors duration-300 ${
        bgActive ? "bg-transparent bg-active" : "bg-slate-50 dark:bg-slate-950"
      }`}>
        {/*
          背景图片激活时在顶部叠加一个半透明渐变，
          让白色文字图标在亮色背景上依然清晰
        */}
        {bgActive && <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-0" />}
        <header className="relative z-50 flex items-center justify-between px-4 sm:px-8 pt-4 sm:pt-7 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Sidebar bookmarks={bookmarks} onDelete={handleDelete} />
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            {showWeather && <WeatherWidget apiKey={weatherLoc.apiKey} cityCode={weatherLoc.cityCode} city={weatherLoc.city} />}
            <TimeWidget />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <SettingsDialog
              webdavConfig={webdavConfig}
              onSaveWebDAV={setWebDAVConfig}
              onPush={pushToCloud}
              onPull={pullFromCloud}
              syncing={syncing}
              syncMsg={syncMsg}
              onExport={exportJSON}
              onImport={importJSON}
              showWeather={showWeather}
              onToggleWeather={() => setShowWeather((v) => !v)}
              weatherLoc={weatherLoc}
              onUpdateWeatherLoc={setWeatherLoc}
              bgConfig={bgConfig}
              onUpdateBg={onUpdateBg}
              onUploadBg={onUploadBg}
            />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <SearchBar />
          <ShortcutsGrid
            bookmarks={bookmarks}
            onAdd={addBookmark}
            onRemove={removeBookmark}
            onUpdate={updateBookmark}
            onMove={moveBookmark}
          />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}