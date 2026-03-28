import { useState, useEffect } from "react";
import {
  MapPin,
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

  const WeatherIcon = ({ condition, className }: { condition: string; className?: string }) => {
    switch (condition) {
      case "Clear": return <Sun className={className} />;
      case "Clouds": return <Cloud className={className} />;
      case "Rain": return <CloudRain className={className} />;
      case "Snow": return <CloudSnow className={className} />;
      default: return <CloudSun className={className} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-44 gap-3">
        <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400 animate-pulse">Syncing atmosphere…</p>
      </div>
    );
  }

  if (locationDenied) {
    return (
      <div className="flex flex-col items-center justify-center h-44 text-center gap-3">
        <MapPinOff size={32} className="text-slate-300" />
        <p className="text-sm font-bold text-slate-600">Location access needed</p>
        <p className="text-xs text-slate-400 max-w-[200px]">Allow location to illuminate your local weather.</p>
        <button
          onClick={fetchWeather}
          className="mt-2 bg-indigo-500 text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-indigo-600 transition-colors"
        >
          Enable Access
        </button>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex items-center justify-center h-44">
        <p className="text-xs text-red-400 font-semibold">{error || "No data"}</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="weather"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between h-full"
      >
        {/* Left: main info */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin size={14} className="text-indigo-500" />
            <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
              {weather.location}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold tracking-tighter text-on-surface">
              {weather.temperature}°
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-on-surface">{weather.condition}</span>
              <span className="text-slate-500 text-xs">Feels like {weather.feelsLike}°</span>
            </div>
          </div>

          {/* Extra stats */}
          <div className="flex gap-5 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Droplets size={12} className="text-indigo-400" />{weather.humidity}%</span>
            <span className="flex items-center gap-1"><Wind size={12} className="text-indigo-400" />{weather.windSpeed} km/h</span>
          </div>

          {/* Forecast row */}
          <div className="flex gap-6 mt-6">
            {weather.forecast.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.day}</span>
                <WeatherIcon condition={d.condition} className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-on-surface">{d.temp}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: large icon */}
        <div className="hidden md:block opacity-20">
          <WeatherIcon condition={weather.condition} className="w-24 h-24 text-indigo-400" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WeatherWidget;
