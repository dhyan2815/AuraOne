// backend/proxy.ts

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import { Request, Response } from 'express';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configurable model and port
const MODEL = process.env.LLM_MODEL || 'qwen2.5-coder:1.5b';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_TIMEOUT = process.env.OLLAMA_TIMEOUT ? parseInt(process.env.OLLAMA_TIMEOUT) : 15000; // 15s

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', model: MODEL });
});

// Define the chat route
app.post('/chat', async (req: Request, res: Response) => {
  try {
    // Validate input
    const prompt = req.body.prompt;
    if (typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Missing or invalid prompt.' });
      return;
    }

    // Make a POST request to the Ollama API with timeout
    const response = await axios.post(
      OLLAMA_URL,
      {
        model: MODEL,
        prompt,
        stream: false,
      },
      { timeout: OLLAMA_TIMEOUT }
    );

    res.json(response.data);
  } catch (error: any) {
    // Log full error for debugging
    console.error('Proxy error:', error && error.stack ? error.stack : error);
    let message = 'Internal server error.';
    if (error.code === 'ECONNABORTED') {
      message = 'Request to LLM timed out.';
    } else if (error.response && error.response.data) {
      message = error.response.data.error || message;
    }
    res.status(500).json({ error: message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy running on http://localhost:${PORT} (Model Used: ${MODEL})`);
});