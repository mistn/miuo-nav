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
  lat: string;
  lon: string;
  city: string;
}

const DEFAULT_WEATHER: WeatherLocation = { lat: "31.2304", lon: "121.4737", city: "Shanghai" };

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
        bgActive ? "bg-transparent" : "bg-slate-50 dark:bg-slate-950"
      }`}>
        <header className="relative z-50 flex items-center justify-between px-8 pt-7">
          <div className="flex items-center gap-3">
            <Sidebar bookmarks={bookmarks} onDelete={handleDelete} />
          </div>

          <div className="flex items-center gap-4">
            {showWeather && <WeatherWidget lat={weatherLoc.lat} lon={weatherLoc.lon} city={weatherLoc.city} />}
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