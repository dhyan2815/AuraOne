export const API_CONFIG = {
  ENV: import.meta.env.DEV ? 'development' : 'production',
  
  WEATHER_API_KEY: import.meta.env.VITE_WEATHER_API_KEY,
  WEATHER_CURRENT_API_URL: "https://api.openweathermap.org/data/2.5/weather",
  WEATHER_FORECAST_API_URL: "https://api.openweathermap.org/data/2.5/forecast",

  NEWS_API_KEY: import.meta.env.VITE_NEWS_API_KEY,
  NEWS_API_URL: "https://newsdata.io/api/1", 

  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  GEMINI_API_URL: "https://generativelanguage.googleapis.com/v1beta",
  GEMINI_MODEL: "gemini-2.5-flash",
  GEMINI_EMBEDDING_MODEL: "gemini-embedding-001",
  
  OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY,
  OPENROUTER_API_URL: "https://openrouter.ai/api/v1/chat/completions",
};

export const getRAGConfig = () => {
  return {
    embeddingModel: API_CONFIG.GEMINI_EMBEDDING_MODEL,
    dimensions: 768,
    threshold: 0.5,
    topK: 10,
  };
};

export const validateApiKeys = () => {
  const missingKeys: string[] = [];
  const warnings: string[] = [];

  if (!API_CONFIG.GEMINI_API_KEY) {
    missingKeys.push("Gemini");
  }

  if (!API_CONFIG.WEATHER_API_KEY) {
    warnings.push("OpenWeatherMap (weather features disabled)");
  }

  if (!API_CONFIG.NEWS_API_KEY) {
    warnings.push("NewsData (news features disabled)");
  }

  if (!API_CONFIG.OPENROUTER_API_KEY) {
    warnings.push("Open Router (deep reasoning fallback disabled)");
  }

  return {
    valid: missingKeys.length === 0,
    missing: missingKeys,
    warnings,
    environment: API_CONFIG.ENV,
  };
};

export const getAIConfig = () => {
  const validation = validateApiKeys();
  
  return {
    gemini: {
      enabled: !!API_CONFIG.GEMINI_API_KEY,
      apiKey: API_CONFIG.GEMINI_API_KEY,
      apiUrl: API_CONFIG.GEMINI_API_URL,
      model: API_CONFIG.GEMINI_MODEL,
    },
    openRouter: {
      enabled: !!API_CONFIG.OPENROUTER_API_KEY,
      apiKey: API_CONFIG.OPENROUTER_API_KEY,
      apiUrl: API_CONFIG.OPENROUTER_API_URL,
      model: "openrouter/free",
    },
    environment: API_CONFIG.ENV,
    validation,
  };
};