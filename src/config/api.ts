// Centralized API configuration — Manages API keys, environment endpoints, and AI/RAG settings.

// Detect current environment to configure API behaviors and safety checks.
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Centralized API configuration object containing environment, weather, news, and AI client settings.
export const API_CONFIG = {
  // Store the active environment string.
  ENV: isDevelopment ? 'development' : 'production',
  
  // OpenWeatherMap API credentials and endpoints.
  WEATHER_API_KEY: import.meta.env.VITE_WEATHER_API_KEY,
  WEATHER_CURRENT_API_URL: "https://api.openweathermap.org/data/2.5/weather",
  WEATHER_FORECAST_API_URL: "https://api.openweathermap.org/data/2.5/forecast",

  // NewsData.io API credentials and endpoint.
  NEWS_API_KEY: import.meta.env.VITE_NEWS_API_KEY,
  NEWS_API_URL: "https://newsdata.io/api/1", 

  // Gemini AI configuration for chat generation and text embeddings.
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  GEMINI_API_URL: "https://generativelanguage.googleapis.com/v1beta",
  GEMINI_MODEL: "gemini-2.5-flash",
  GEMINI_EMBEDDING_MODEL: "gemini-embedding-001",
  
  // OpenRouter API fallback configuration for deep reasoning models.
  OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY,
  OPENROUTER_API_URL: "https://openrouter.ai/api/v1/chat/completions",
};

// Retrieve configuration parameters for the RAG service.
export const getRAGConfig = () => {
  return {
    embeddingModel: API_CONFIG.GEMINI_EMBEDDING_MODEL,
    dimensions: 768, // Dimensions required by gemini-embedding-001.
    threshold: 0.5, // Similarity score threshold for relevance.
    topK: 10, // Maximum number of context chunks to retrieve.
  };
};

// Validate presence of required API keys and compile warnings for missing optional services.
export const validateApiKeys = () => {
  const missingKeys: string[] = [];
  const warnings: string[] = [];

  // Enforce Gemini API key as a critical dependency.
  if (!API_CONFIG.GEMINI_API_KEY) {
    missingKeys.push("Gemini");
  }

  // Warn about missing weather features if weather key is absent.
  if (!API_CONFIG.WEATHER_API_KEY) {
    warnings.push("OpenWeatherMap (weather features disabled)");
  }

  // Warn about missing news features if news key is absent.
  if (!API_CONFIG.NEWS_API_KEY) {
    warnings.push("NewsData (news features disabled)");
  }

  // Warn about missing fallback model support if OpenRouter key is absent.
  if (!API_CONFIG.OPENROUTER_API_KEY) {
    warnings.push("Open Router (deep reasoning fallback disabled)");
  }

  // Log strict warning if Gemini key is missing in production environment.
  if (isProduction) {
    if (!API_CONFIG.GEMINI_API_KEY) {
      // Missing critical key in production
    }
  }

  // Structure and return validation outcome with environmental context.
  const result = {
    valid: missingKeys.length === 0,
    missing: missingKeys,
    warnings,
    environment: API_CONFIG.ENV,
  };

  return result;
};

// Compile and retrieve configuration settings for AI model providers.
export const getAIConfig = () => {
  const validation = validateApiKeys();
  
  return {
    // Primary Gemini configuration.
    gemini: {
      enabled: !!API_CONFIG.GEMINI_API_KEY,
      apiKey: API_CONFIG.GEMINI_API_KEY,
      apiUrl: API_CONFIG.GEMINI_API_URL,
      model: API_CONFIG.GEMINI_MODEL,
    },
    // Fallback OpenRouter configuration.
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

// Export configuration object as default.
export { API_CONFIG as default };