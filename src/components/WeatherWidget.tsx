import { useState, useEffect } from "react";
import { CloudSun, CloudOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WeatherData {
  temperature: number;
  description: string;
}

interface WeatherWidgetProps {
  lat: string;
  lon: string;
  city: string;
}

export function WeatherWidget({ lat, lon, city }: WeatherWidgetProps) {
  const { t } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const wmoCodes: Record<number, string> = {
    0: t("weather.clear"), 1: t("weather.mainly_clear"), 2: t("weather.partly_cloudy"), 3: t("weather.overcast"),
    45: t("weather.fog"), 48: t("weather.rime_fog"), 51: t("weather.light_drizzle"), 53: t("weather.drizzle"), 55: t("weather.dense_drizzle"),
    61: t("weather.light_rain"), 63: t("weather.rain"), 65: t("weather.heavy_rain"),
    71: t("weather.light_snow"), 73: t("weather.snow"), 75: t("weather.heavy_snow"),
    80: t("weather.showers"), 81: t("weather.moderate_showers"), 82: t("weather.violent_showers"), 95: t("weather.thunderstorm"),
  };

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const current = data.current;
        setWeather({
          temperature: Math.round(current.temperature_2m),
          description: wmoCodes[current.weather_code] ?? "—",
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.warn("Weather API request timed out");
        } else {
          console.warn("Weather API fetch failed:", error);
        }
        setIsError(true);
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    };

    fetchWeather();
    return () => { controller.abort(); clearTimeout(timeoutId); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500">
        <CloudSun className="size-4 animate-pulse" />
        <span>—°</span>
      </div>
    );
  }

  if (isError || !weather) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500">
        <CloudOff className="size-4" />
        <span>{t("weather.offline")}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
      <CloudSun className="size-4" />
      <span>{weather.temperature}°</span>
      <span className="text-slate-400 dark:text-slate-500">{city}</span>
    </div>
  );
}