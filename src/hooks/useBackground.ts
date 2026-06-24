import { useState, useCallback, useEffect } from "react";

export interface BgConfig {
  enabled: boolean;
  type: "bing" | "custom" | "upload";
  customUrl: string;
  uploadedData: string;
}

const STORAGE_KEY = "navidash-bg";
const BING_PROXY = "https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN";

function load(): BgConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { enabled: false, type: "bing", customUrl: "", uploadedData: "" };
}

function save(cfg: BgConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export function useBackground() {
  const [config, setConfig] = useState<BgConfig>(load);
  const [bgUrl, setBgUrl] = useState<string>("");

  useEffect(() => { save(config); }, [config]);

  const updateConfig = useCallback((patch: Partial<BgConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    if (!config.enabled) { setBgUrl(""); return; }
    if (config.type === "upload" && config.uploadedData) {
      setBgUrl(config.uploadedData);
    } else if (config.type === "custom" && config.customUrl) {
      setBgUrl(config.customUrl);
    } else if (config.type === "bing") {
      setBgUrl(BING_PROXY);
    } else {
      setBgUrl("");
    }
  }, [config.enabled, config.type, config.customUrl, config.uploadedData]);

  const handleUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setConfig((prev) => ({ ...prev, type: "upload", uploadedData: reader.result as string, enabled: true }));
    };
    reader.readAsDataURL(file);
  }, []);

  return { config, updateConfig, bgUrl, handleUpload };
}
