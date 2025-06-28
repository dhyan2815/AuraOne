// backend/server.ts

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import { Request, Response } from 'express';

const app = express();

//Middleware
app.use(cors());
app.use(bodyParser.json());

// Define the chat route
app.post('/chat', async (req: Request, res: Response) => {
  try {
    // Make a POST request to the Ollama API
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: "qwen2.5-coder:1.5b", 
      prompt: req.body.prompt,     
      stream: false,               
    });
    
    res.json(response.data);
  } catch (error: any) { 
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy running on http://localhost:${PORT}`);
});
