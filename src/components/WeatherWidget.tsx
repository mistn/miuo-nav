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
      /* text-shadow 紧贴文字边缘提供精细对比，避免 drop-shadow 的模糊廉价感 */
      <div className="flex items-center gap-1.5 text-sm text-slate-900 font-medium [text-shadow:_0_1px_2px_rgb(255_255_255_/_80%)] dark:text-white dark:[text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)]">
        <CloudOff className="size-4 header-icon" />
        <span className="header-text">{t("weather.offline")}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-slate-900 font-medium [text-shadow:_0_1px_2px_rgb(255_255_255_/_80%)] dark:text-white dark:[text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)]">
        <CloudSun className="size-4 animate-pulse header-icon" />
        <span className="header-text">—°</span>
      </div>
    );
  }

  if (isError || !weather) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-slate-900 font-medium [text-shadow:_0_1px_2px_rgb(255_255_255_/_80%)] dark:text-white dark:[text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)]">
        <CloudOff className="size-4 header-icon" />
        <span className="header-text">{t("weather.offline")}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm text-slate-900 font-medium [text-shadow:_0_1px_2px_rgb(255_255_255_/_80%)] dark:text-white dark:[text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)]">
      <CloudSun className="size-4 header-icon" />
      <span className="header-text">{weather.temperature}°</span>
      <span className="header-text">{city}</span>
    </div>
  );
}