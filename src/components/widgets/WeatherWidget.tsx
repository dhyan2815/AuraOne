import { useState, useEffect } from "react";
import { MapPin, Droplets, Wind, Thermometer } from "lucide-react";
import { API_CONFIG } from "../../config/api";

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

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );

        const { latitude, longitude } = position.coords;

        const currentWeatherResponse = await fetch(
          `${API_CONFIG.WEATHER_CURRENT_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_CONFIG.WEATHER_API_KEY}`
        );

        if (!currentWeatherResponse.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const currentWeather = await currentWeatherResponse.json();

        const forecastResponse = await fetch(
          `${API_CONFIG.WEATHER_FORECAST_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_CONFIG.WEATHER_API_KEY}`
        );

        if (!forecastResponse.ok) {
          throw new Error("Failed to fetch forecast data");
        }

        const forecastData = await forecastResponse.json();

        const dailyForecast = forecastData.list
          .reduce((acc: any[], item: any) => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (
              !acc.find(
                (day: any) =>
                  new Date(day.dt * 1000).toLocaleDateString() === date
              )
            ) {
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
            day: new Date(day.dt * 1000).toLocaleDateString("en-US", {
              weekday: "short",
            }),
            temp: Math.round(day.main.temp),
            condition: day.weather[0].main,
          })),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch weather data"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full mb-2"></div>
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-error-600 dark:text-error-400">{error}</p>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <div className="text-center md:text-left mb-4 md:mb-0 ">
          <div className="flex items-center justify-center md:justify-start text-xl text-slate-600 dark:text-slate-400 mb-1">
            <MapPin size={30} className="mr-1" />
            {weather.location}
          </div>
          <div className="flex items-center">
            <span className="text-4xl font-semibold">
              {weather.temperature}°
            </span>
            <span className="ml-2 text-slate-600 dark:text-slate-400 text-3xl">
              {weather.condition}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 mb-1">
              <Droplets size={30} />
            </div>
            <div className="text-base text-slate-600 dark:text-slate-400">
              {weather.humidity}%
            </div>
            <div className="text-base text-slate-500 dark:text-slate-500">
              Humidity
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 mb-1">
              <Wind size={30} />
            </div>
            <div className="text-base text-slate-600 dark:text-slate-400">
              {weather.windSpeed} mph
            </div>
            <div className="text-base text-slate-500 dark:text-slate-500">
              Wind
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 mb-1">
              <Thermometer size={30} />
            </div>
            <div className="text-base text-slate-600 dark:text-slate-400">
              68°/54°
            </div>
            <div className="text-base text-slate-500 dark:text-slate-500">
              Min/Max
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 text-center pt-3 border-t border-slate-100 dark:border-slate-700">
        {weather.forecast.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="font-medium">{day.day}</div>
            <div className="text-2xl my-1">
              {day.condition === "Clear"
                ? "☀️"
                : day.condition === "Clouds"
                ? "☁️"
                : day.condition === "Rain"
                ? "🌧️"
                : day.condition === "Snow"
                ? "❄️"
                : "🌤️"}
            </div>
            <div className="text-sm">{day.temp}°</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherWidget;
