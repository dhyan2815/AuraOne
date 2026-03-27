import { useState, useEffect } from "react";
import { MapPin, Droplets, Wind, MapPinOff, Sun, Cloud, CloudRain, CloudSnow, CloudSun } from "lucide-react";
import { API_CONFIG } from "../../config/api";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
  }>;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        setError("Geolocation is not supported by this browser");
        setLocationPermission('denied');
        return;
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, (error) => {
            setLocationPermission('denied');
            reject(new Error('location_permission_denied'));
          }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
        }
      );

      setLocationPermission('granted');
      const { latitude, longitude } = position.coords;

      const [currentWeatherResponse, forecastResponse] = await Promise.all([
        fetch(`${API_CONFIG.WEATHER_CURRENT_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_CONFIG.WEATHER_API_KEY}`),
        fetch(`${API_CONFIG.WEATHER_FORECAST_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_CONFIG.WEATHER_API_KEY}`)
      ]);

      if (!currentWeatherResponse.ok || !forecastResponse.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const currentWeather = await currentWeatherResponse.json();
      const forecastData = await forecastResponse.json();

      const dailyForecast = forecastData.list
        .reduce((acc: any[], item: any) => {
          const date = new Date(item.dt * 1000).toLocaleDateString();
          if (!acc.find((day: any) => new Date(day.dt * 1000).toLocaleDateString() === date)) {
            acc.push(item);
          }
          return acc;
        }, [])
        .slice(0, 5);

      setWeather({
        location: currentWeather.name,
        temperature: Math.round(currentWeather.main.temp),
        condition: currentWeather.weather[0].main,
        humidity: currentWeather.main.humidity,
        windSpeed: Math.round(currentWeather.wind.speed * 2.237),
        forecast: dailyForecast.map((day: any) => ({
          day: new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" }),
          temp: Math.round(day.main.temp),
          condition: day.weather[0].main,
        })),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch weather data";
      if (errorMessage !== 'location_permission_denied') {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const WeatherIcon = ({ condition, className }: { condition: string, className?: string }) => {
    switch (condition) {
      case "Clear": return <Sun className={className} />;
      case "Clouds": return <Cloud className={className} />;
      case "Rain": return <CloudRain className={className} />;
      case "Snow": return <CloudSnow className={className} />;
      default: return <CloudSun className={className} />;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl flex items-center justify-center mb-3">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-sm font-bold text-slate-500 animate-pulse">Syncing Atmosphere...</p>
        </div>
      );
    }

    if (locationPermission === 'denied') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl flex items-center justify-center mb-4">
            <MapPinOff size={32} className="text-slate-400" />
          </div>
          <h3 className="text-md font-bold mb-2">Location Access Needed</h3>
          <p className="text-xs text-slate-500 mb-6 max-w-[200px]">Allow location to illuminate your local weather data.</p>
          <button onClick={fetchWeather} className="bg-primary text-white font-bold py-2 px-6 rounded-lg text-sm">
            Enable Access
          </button>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div className="bg-red-500/10 p-4 rounded-lg">
            <p className="text-xs font-bold text-red-500">{error}</p>
          </div>
        </div>
      );
    }

    if (!weather) return null;

    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-1">
              <MapPin size={14} className="mr-1 text-primary" />
              {weather.location}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tighter text-text">
                {weather.temperature}°
              </span>
              <span className="text-md font-medium text-slate-500 italic">
                {weather.condition}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <Droplets size={16} className="text-secondary mx-auto mb-1" />
              <span className="text-xs font-bold">{weather.humidity}%</span>
            </div>
            <div className="text-center">
              <Wind size={16} className="text-cta mx-auto mb-1" />
              <span className="text-xs font-bold">{weather.windSpeed}m/s</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 mt-6">
          {weather.forecast.map((day, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className="flex flex-col items-center py-3 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border border-slate-200 dark:border-gray-700"
            >
              <span className="text-xs font-bold text-slate-500 mb-2">{day.day}</span>
              <WeatherIcon condition={day.condition} className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-bold">{day.temp}°</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Local Atmosphere</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
