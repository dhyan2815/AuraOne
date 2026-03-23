import { useState, useEffect } from "react";
import { MapPin, Droplets, Wind, MapPinOff } from "lucide-react"; // Importing icons
import { API_CONFIG } from "../../config/api"; // Importing API configuration
import { motion } from "framer-motion";

// Defining the structure of the weather data
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

// Weather Widget Component
const WeatherWidget = () => {

  const [weather, setWeather] = useState<WeatherData | null>(null); // Weather data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error message
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown'); // Location permission status

  // useEffect hook to fetch weather data on component mount
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true); // Set loading to true before fetching data
        setError(null); // Clear any previous errors

        // Check if geolocation is supported
        if (!navigator.geolocation) {
          setError("Geolocation is not supported by this browser");
          setLocationPermission('denied');
          return;
        }

        // Get current position using geolocation API
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve, 
              (error) => {
                // Handle different geolocation errors
                switch (error.code) {
                  case error.PERMISSION_DENIED:
                    setLocationPermission('denied');
                    reject(new Error('location_permission_denied'));
                    break;
                  case error.POSITION_UNAVAILABLE:
                    reject(new Error('Location information unavailable'));
                    break;
                  case error.TIMEOUT:
                    reject(new Error('Location request timed out'));
                    break;
                  default:
                    reject(new Error('An unknown error occurred'));
                    break;
                }
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
              }
            );
          }
        );

        setLocationPermission('granted');
        const { latitude, longitude } = position.coords; // Extract latitude and longitude

        // Fetch current weather data
        const currentWeatherResponse = await fetch(
          `${API_CONFIG.WEATHER_CURRENT_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_CONFIG.WEATHER_API_KEY}`
        );

        // Throw error if fetching current weather data fails
        if (!currentWeatherResponse.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const currentWeather = await currentWeatherResponse.json(); // Parse current weather data

        // Fetch forecast data
        const forecastResponse = await fetch(
          `${API_CONFIG.WEATHER_FORECAST_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_CONFIG.WEATHER_API_KEY}`
        );

        // Throw error if fetching forecast data fails
        if (!forecastResponse.ok) {
          throw new Error("Failed to fetch forecast data");
        }

        const forecastData = await forecastResponse.json(); // Parse forecast data

        // Process forecast data to get daily forecast
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
          .slice(0, 5); // Get the first 5 days

        // Set weather data
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
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch weather data";
        
        // Only show technical error if it's not a location permission issue
        if (errorMessage !== 'location_permission_denied') {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  // Function to request location permission again
  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      setError(null);
      setLocationPermission('unknown');

      // Check if geolocation is supported
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by this browser");
        setLocationPermission('denied');
        return;
      }

      // Request location permission again
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve, 
            (error) => {
              // Handle different geolocation errors
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  setLocationPermission('denied');
                  reject(new Error('location_permission_denied'));
                  break;
                case error.POSITION_UNAVAILABLE:
                  reject(new Error('Location information unavailable'));
                  break;
                case error.TIMEOUT:
                  reject(new Error('Location request timed out'));
                  break;
                default:
                  reject(new Error('An unknown error occurred'));
                  break;
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            }
          );
        }
      );

      setLocationPermission('granted');
      const { latitude, longitude } = position.coords;

      // Fetch current weather data
      const currentWeatherResponse = await fetch(
        `${API_CONFIG.WEATHER_CURRENT_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_CONFIG.WEATHER_API_KEY}`
      );

      if (!currentWeatherResponse.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const currentWeather = await currentWeatherResponse.json();

      // Fetch forecast data
      const forecastResponse = await fetch(
        `${API_CONFIG.WEATHER_FORECAST_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_CONFIG.WEATHER_API_KEY}`
      );

      if (!forecastResponse.ok) {
        throw new Error("Failed to fetch forecast data");
      }

      const forecastData = await forecastResponse.json();

      // Process forecast data to get daily forecast
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

      // Set weather data
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
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch weather data";
      
      // Only show technical error if it's not a location permission issue
      if (errorMessage !== 'location_permission_denied') {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-aurora-on-surface-variant font-bold tracking-widest text-xs uppercase animate-pulse">Syncing Atmosphere...</p>
        </div>
      </div>
    );
  }

  // Render location permission denied state
  if (locationPermission === 'denied') {
    return (
      <div className="text-center py-6 h-full flex flex-col justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <MapPinOff size={32} className="text-aurora-on-surface-variant" />
          </div>
          <h3 className="text-lg font-black tracking-tighter mb-2">Location Access Needed</h3>
          <p className="text-sm text-aurora-on-surface-variant font-medium mb-6 max-w-[200px]">Allow location to illuminate your local weather data.</p>
          <button
            onClick={requestLocationPermission}
            className="btn-aurora-primary px-6 py-2 text-sm"
          >
            Enable Access
          </button>
        </div>
      </div>
    );
  }

  // Render error state (only for technical/API issues)
  if (error) {
    return (
      <div className="text-center py-8 h-full flex flex-col justify-center">
        <div className="glass-panel p-4 rounded-2xl border-error/10 bg-error/5">
          <p className="text-sm font-bold text-error">{error}</p>
        </div>
      </div>
    );
  }

  // Render nothing if weather data is null
  if (!weather) return null;

  // Render weather data
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center text-xs font-black uppercase tracking-widest text-aurora-on-surface-variant mb-1">
            <MapPin size={12} className="mr-1 text-primary" />
            {weather.location}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter text-aurora-on-surface">
              {weather.temperature}°
            </span>
            <span className="text-base font-bold text-primary italic">
              {weather.condition}
            </span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex flex-col items-center p-2 glass rounded-xl min-w-[60px]">
            <Droplets size={16} className="text-secondary mb-1" />
            <span className="text-xs font-black">{weather.humidity}%</span>
          </div>
          <div className="flex flex-col items-center p-2 glass rounded-xl min-w-[60px]">
            <Wind size={16} className="text-tertiary mb-1" />
            <span className="text-xs font-black">{weather.windSpeed}m</span>
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
            className="flex flex-col items-center py-3 glass rounded-2xl hover:bg-white/40 transition-colors"
          >
            <span className="text-[10px] font-black uppercase tracking-tighter text-aurora-on-surface-variant mb-2">{day.day}</span>
            <div className="text-2xl mb-2 filter drop-shadow-sm">
              {day.condition === "Clear" ? "☀️" : 
               day.condition === "Clouds" ? "☁️" : 
               day.condition === "Rain" ? "🌧️" : 
               day.condition === "Snow" ? "❄️" : "🌤️"}
            </div>
            <span className="text-sm font-black">{day.temp}°</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WeatherWidget;

