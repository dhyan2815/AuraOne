import { useState, useEffect } from "react";
import { MapPin, Droplets, Wind, Thermometer, MapPinOff } from "lucide-react"; // Importing icons
import { API_CONFIG } from "../../config/api"; // Importing API configuration

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
      <div className="flex justify-center items-center h-32">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full mb-2"></div>
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Render location permission denied state
  if (locationPermission === 'denied') {
    return (
      <div className="text-center py-6">
        <div className="flex flex-col items-center">
          <MapPinOff size={48} className="text-slate-400 dark:text-slate-500 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Location Access Required
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-xs">
            Allow location access to see weather information for your area
          </p>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button
              onClick={requestLocationPermission}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              Try Again
            </button>
            <details className="mt-2">
              <summary className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
                How to enable location access?
              </summary>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <p className="mb-2"><strong>Chrome/Edge:</strong></p>
                <ul className="list-disc list-inside space-y-1 mb-2">
                  <li>Click the lock icon in the address bar</li>
                  <li>Change "Location" to "Allow"</li>
                  <li>Refresh the page</li>
                </ul>
                <p className="mb-2"><strong>Firefox:</strong></p>
                <ul className="list-disc list-inside space-y-1 mb-2">
                  <li>Click the shield icon in the address bar</li>
                  <li>Click "Allow" for location access</li>
                  <li>Refresh the page</li>
                </ul>
                <p className="mb-2"><strong>Safari:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Go to Safari → Preferences → Websites → Location</li>
                  <li>Allow location access for this site</li>
                  <li>Refresh the page</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // Render error state (only for technical/API issues)
  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-error-600 dark:text-error-400">{error}</p>
      </div>
    );
  }

  // Render nothing if weather data is null
  if (!weather) return null;

  // Render weather data
  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-evenly mb-2">

        {/* Weather location, temperature and condition */}
        <div className="text-center md:text-left mb-2 md:mb-0 ">
          <div className="flex items-center justify-center md:justify-start text-lg text-slate-600 dark:text-slate-400 mb-2">
            <MapPin size={22} className="mr-1 mb-1" />
            {weather.location}
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-semibold">
              {weather.temperature}°
            </span>
            <span className="ml-2 text-slate-600 dark:text-slate-400 text-xl">
              {weather.condition}
            </span>
          </div>
        </div>

        {/* Weather humidity */}
        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 mb-1">
              <Droplets size={30} />
            </div>
            <div className="text-base font-bold text-slate-600 dark:text-slate-400">
              {weather.humidity}%
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              Humidity
            </div>
          </div>

          {/* Weather windspeed */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 mb-1">
              <Wind size={30} />
            </div>
            <div className="text-base font-bold text-slate-600 dark:text-slate-400">
              {weather.windSpeed} mph
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              Wind
            </div>
          </div>

          {/* Weather temperature */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 mb-1">
              <Thermometer size={30} />
            </div>
            <div className="text-base font-bold text-slate-600 dark:text-slate-400">
              24°/35°
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              Min/Max
            </div>
          </div>
        </div>
      </div>

      {/* Days weather temperature */}
      <div className="grid grid-cols-5 gap-x-0 text-center pt-1 border-slate-100 dark:border-slate-700">
        {weather.forecast.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="font-large">{day.day}</div>
            <div className="text-4xl">
              {day.condition === "Clear"
                ? "☀️"
                : day.condition === "Clouds"
                  ? "☁️"
                  : day.condition === "Rain"
                    ? "🌧️"
                    : day.condition === "Snow"
                      ? "❄️"
                      : "🌤️"
              }
            </div>
            <div className="text-base font-bold text-slate-600 dark:text-slate-400">{day.temp}°</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherWidget;
