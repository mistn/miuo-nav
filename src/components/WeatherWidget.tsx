import { useState, useEffect } from "react";
import { CloudSun, CloudOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WeatherWidgetProps {
  apiKey: string;
  cityCode: string;
  city: string;
}

export function WeatherWidget({ apiKey, cityCode, city }: WeatherWidgetProps) {
  const { t } = useTranslation();
  const [weather, setWeather] = useState<{ temperature: string; description: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!apiKey || !cityCode) { setIsLoading(false); setIsError(true); return; }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await fetch(
          `/api/amap/weather/weatherInfo?key=${apiKey}&city=${cityCode}&extensions=base`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.status !== "1" || !data.lives?.[0]) throw new Error(data.info);
        setWeather({
          temperature: data.lives[0].temperature,
          description: data.lives[0].weather,
        });
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    };

    fetchWeather();
    return () => { controller.abort(); clearTimeout(timeoutId); };
  }, [apiKey, cityCode]);

  if (!apiKey || !cityCode) {
    return (
      /* drop-shadow 保证顶部栏文字在动态壁纸上始终可读，明暗模式分别用白色/黑色阴影 */
      <div className="flex items-center gap-1.5 text-sm text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:text-zinc-100 dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <CloudOff className="size-4 header-icon" />
        <span className="header-text">{t("weather.offline")}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:text-zinc-100 dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <CloudSun className="size-4 animate-pulse header-icon" />
        <span className="header-text">—°</span>
      </div>
    );
  }

  if (isError || !weather) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:text-zinc-100 dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <CloudOff className="size-4 header-icon" />
        <span className="header-text">{t("weather.offline")}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:text-zinc-100 dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
      <CloudSun className="size-4 header-icon" />
      <span className="header-text">{weather.temperature}°</span>
      <span className="header-text">{city}</span>
    </div>
  );
}