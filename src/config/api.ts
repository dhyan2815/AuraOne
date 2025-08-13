// api.ts

// Environment detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Configuration with enhanced security and environment handling
export const API_CONFIG = {
  // Environment info
  ENV: isDevelopment ? 'development' : 'production',
  
  // Weather API
  WEATHER_API_KEY: import.meta.env.VITE_WEATHER_API_KEY,
  WEATHER_CURRENT_API_URL: "https://api.openweathermap.org/data/2.5/weather",
  WEATHER_FORECAST_API_URL: "https://api.openweathermap.org/data/2.5/forecast",

  // News API
  NEWS_API_KEY: import.meta.env.VITE_NEWS_API_KEY,
  NEWS_API_URL: "https://newsdata.io/api/1", 

  // Gemini API - Enhanced configuration
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  GEMINI_API_URL: "https://generativelanguage.googleapis.com/v1beta",
  GEMINI_MODEL: "gemini-2.0-flash",
  
  // Qwen API - Local development fallback
  QWEN_ENDPOINT: isDevelopment ? "http://localhost:11434/api/generate" : null,
  QWEN_MODEL: "qwen2.5-coder:1.5b",
};

// Enhanced API key validation with detailed reporting
export const validateApiKeys = () => {
  const missingKeys: string[] = [];
  const warnings: string[] = [];

  // Required for production
  if (!API_CONFIG.GEMINI_API_KEY) {
    missingKeys.push("Gemini");
  }

  // Optional but recommended
  if (!API_CONFIG.WEATHER_API_KEY) {
    warnings.push("OpenWeatherMap (weather features disabled)");
  }

  if (!API_CONFIG.NEWS_API_KEY) {
    warnings.push("NewsData (news features disabled)");
  }

  // Development-specific checks
  if (isDevelopment) {
    if (!API_CONFIG.QWEN_ENDPOINT) {
      warnings.push("Qwen endpoint not configured (local fallback disabled)");
    }
  }

  // Production-specific checks
  if (isProduction) {
    if (!API_CONFIG.GEMINI_API_KEY) {
      console.error("❌ CRITICAL: Gemini API key missing in production!");
    }
  }

  const result = {
    valid: missingKeys.length === 0,
    missing: missingKeys,
    warnings,
    environment: API_CONFIG.ENV,
  };

  // Log validation results
  if (missingKeys.length > 0) {
    console.error("❌ Missing required API keys:", missingKeys.join(", "));
  }
  
  if (warnings.length > 0) {
    console.warn("⚠️ API configuration warnings:", warnings.join(", "));
  }

  if (result.valid) {
    // API configuration validated successfully
  }

  return result;
};

// Configuration helper for AI service
export const getAIConfig = () => {
  const validation = validateApiKeys();
  
  return {
    gemini: {
      enabled: !!API_CONFIG.GEMINI_API_KEY,
      apiKey: API_CONFIG.GEMINI_API_KEY,
      apiUrl: API_CONFIG.GEMINI_API_URL,
      model: API_CONFIG.GEMINI_MODEL,
    },
    qwen: {
      enabled: isDevelopment && !!API_CONFIG.QWEN_ENDPOINT,
      endpoint: API_CONFIG.QWEN_ENDPOINT,
      model: API_CONFIG.QWEN_MODEL,
    },
    environment: API_CONFIG.ENV,
    validation,
  };
};

// Export configuration for external use
export { API_CONFIG as default };