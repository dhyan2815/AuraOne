import { useState, useEffect } from 'react';
import { MapPin, Droplets, Wind, Thermometer } from 'lucide-react';

// Mock data for demonstration
const mockWeatherData = {
  location: 'San Francisco, CA',
  temperature: 68,
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 8,
  forecast: [
    { day: 'Tue', temp: 70, condition: 'Sunny' },
    { day: 'Wed', temp: 72, condition: 'Clear' },
    { day: 'Thu', temp: 68, condition: 'Cloudy' },
    { day: 'Fri', temp: 66, condition: 'Rain' },
    { day: 'Sat', temp: 69, condition: 'Partly Cloudy' },
  ],
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState(mockWeatherData);
  const [loading, setLoading] = useState(false);
  
  // In a real application, you would fetch weather data from the OpenWeatherMap API
  useEffect(() => {
    // Simulating API loading
    setLoading(true);
    setTimeout(() => {
      setWeather(mockWeatherData);
      setLoading(false);
    }, 1000);
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
  
  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <div className="flex items-center justify-center md:justify-start text-sm text-slate-600 dark:text-slate-400 mb-1">
            <MapPin size={14} className="mr-1" />
            {weather.location}
          </div>
          <div className="flex items-center">
            <span className="text-4xl font-semibold">{weather.temperature}°</span>
            <span className="ml-2 text-slate-600 dark:text-slate-400">{weather.condition}</span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 mb-1">
              <Droplets size={20} />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {weather.humidity}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              Humidity
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 mb-1">
              <Wind size={20} />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {weather.windSpeed} mph
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              Wind
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 mb-1">
              <Thermometer size={20} />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              68°/54°
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              Min/Max
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2 text-center pt-3 border-t border-slate-100 dark:border-slate-700">
        {weather.forecast.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="font-medium">{day.day}</div>
            <div className="text-2xl my-1">{day.condition === 'Sunny' ? '☀️' : day.condition === 'Clear' ? '🌙' : day.condition === 'Cloudy' ? '☁️' : day.condition === 'Rain' ? '🌧️' : '🌤️'}</div>
            <div className="text-sm">{day.temp}°</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherWidget;