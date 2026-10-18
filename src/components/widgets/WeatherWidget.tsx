// Weather Mini-Widget — Renders a dashboard sidebar utility presenting current weather conditions and 3-day forecasts based on geolocation coordinates.

import { useState, useEffect } from "react";
import {
  MapPinOff,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Wind,
} from "lucide-react";
import { API_CONFIG } from "../../config/api";
import { motion, AnimatePresence } from "framer-motion";

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{ day: string; temp: number; condition: string }>;
}

interface ApiForecastItem {
  dt: number;
  main: { temp: number; feels_like: number };
  weather: { main: string }[];
}

const WeatherIcon = ({ condition, className }: { condition: string; className?: string }) => {
  switch (condition) {
    case "Clear": return <Sun className={className} />;
    case "Clouds": return <Cloud className={className} />;
    case "Rain": return <CloudRain className={className} />;
    case "Snow": return <CloudSnow className={className} />;
    default: return <CloudSun className={className} />;
  }
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!navigator.geolocation) throw new Error("Geolocation not supported");

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, () => {
          setLocationDenied(true);
          reject(new Error("location_denied"));
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
      });

      const { latitude, longitude } = position.coords;
      const [cur, fore] = await Promise.all([
        fetch(`${API_CONFIG.WEATHER_CURRENT_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_CONFIG.WEATHER_API_KEY}`),
        fetch(`${API_CONFIG.WEATHER_FORECAST_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_CONFIG.WEATHER_API_KEY}`),
      ]);

      if (cur.status === 401 || fore.status === 401) {
        throw new Error("Invalid Weather API Key");
      }

      if (!cur.ok || !fore.ok) throw new Error("Weather API error");

      const curData = await cur.json();
      const foreData = await fore.json();

      const dailyForecast: ApiForecastItem[] = foreData.list
        .reduce((acc: ApiForecastItem[], item: ApiForecastItem) => {
          const d = new Date(item.dt * 1000).toLocaleDateString();
          if (!acc.find((x) => new Date(x.dt * 1000).toLocaleDateString() === d)) acc.push(item);
          return acc;
        }, [])
        .slice(0, 3);

      setWeather({
        location: curData.name,
        temperature: Math.round(curData.main.temp),
        feelsLike: Math.round(curData.main.feels_like),
        condition: curData.weather[0].main,
        humidity: curData.main.humidity,
        windSpeed: Math.round(curData.wind.speed * 3.6),
        forecast: dailyForecast.map((d: ApiForecastItem) => ({
          day: new Date(d.dt * 1000).toLocaleDateString("en-US", { weekday: "short" }),
          temp: Math.round(d.main.temp),
          condition: d.weather[0].main,
        })),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      if (msg !== "location_denied") setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(); }, []);

  if (loading) {
    return (
      <div className="grid gap-3" role="status" aria-label="Loading weather">
        <div className="lm-skel h-14 w-28 !bg-white/50" />
        <div className="lm-skel h-5 w-48 !bg-white/50" />
        <div className="lm-skel h-12 w-full !bg-white/50" />
      </div>
    );
  }

  if (locationDenied) {
    return (
      <div className="flex flex-col items-start gap-2">
        <MapPinOff size={28} />
        <p className="font-bold">Location access needed</p>
        <p className="max-w-[240px] text-sm">Allow location to see your local weather.</p>
        <button onClick={fetchWeather} className="lm-btn lm-btn-sm !bg-[#1F211E] !text-white">
          Enable access
        </button>
      </div>
    );
  }

  if (error || !weather) {
    return <p className="lm-error !bg-white/50 !text-[#C8321F]">{error || "No data"}</p>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key="weather" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <b className="lm-num block text-[72px]">{weather.temperature}°</b>
        <p className="mt-1 font-semibold">
          {weather.location} · {weather.condition.toLowerCase()} · feels like {weather.feelsLike}°
        </p>
        <p className="mt-1 flex gap-4 text-sm">
          <span className="flex items-center gap-1"><Droplets size={13} />{weather.humidity}%</span>
          <span className="flex items-center gap-1"><Wind size={13} />{weather.windSpeed} km/h</span>
        </p>

        <div className="mt-3.5 grid grid-cols-3 gap-1.5 text-center font-semibold">
          {weather.forecast.map((d, i) => (
            <span key={i} className="rounded-2xl bg-white/50 py-2">
              {d.day}
              <WeatherIcon condition={d.condition} className="mx-auto my-1 h-5 w-5" />
              {d.temp}°
            </span>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WeatherWidget;
