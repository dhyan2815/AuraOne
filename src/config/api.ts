// api.ts

// API Configuration
export const API_CONFIG = {
  // Weather API
  WEATHER_API_KEY: import.meta.env.VITE_WEATHER_API_KEY,
  WEATHER_CURRENT_API_URL: "https://api.openweathermap.org/data/2.5/weather",
  WEATHER_FORECAST_API_URL: "https://api.openweathermap.org/data/2.5/forecast",

  // News API
  NEWS_API_KEY: import.meta.env.VITE_NEWS_API_KEY,
  NEWS_API_URL: "https://newsdata.io/api/1", 

  // Gemini API
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  GEMINI_API_URL: "https://generativelanguage.googleapis.com/v1beta",
};

// Special export for Gemini API Responses
export const generateGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(
      `${API_CONFIG.GEMINI_API_URL}/models/gemini-2.0-flash:generateContent?key=${API_CONFIG.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // Extract the response text based on Gemini's response structure
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response from Gemini.");
    }

    return text;
  } catch (err) {
    console.error("Gemini API error:", err);
    return "Sorry, something went wrong with the AI.";
  }
};

// Enhanced API key validation
export const validateApiKeys = () => {
  const missingKeys: string[] = [];

  if (!API_CONFIG.WEATHER_API_KEY) {
    missingKeys.push("OpenWeatherMap");
  }

  if (!API_CONFIG.NEWS_API_KEY) {
    missingKeys.push("NewsData");
  }

  if (!API_CONFIG.GEMINI_API_KEY) {
    missingKeys.push("Gemini");
  }

  if (missingKeys.length > 0) {
    console.error("Missing API Keys:", missingKeys.join(", "));
    return { valid: false, missing: missingKeys };
  }

  return { valid: true, missing: [] };
};