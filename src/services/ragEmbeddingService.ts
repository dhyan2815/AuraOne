// RAG embedding service — Generates 768-dimensional vector embeddings using the Gemini API.

import { API_CONFIG } from '../config/api';

// Structure of the response returned by the single-text Gemini embedding endpoint.
interface EmbeddingResponse {
  embedding: {
    values: number[]; // Array of 768 float values.
  };
}

// Structure of the response returned by the batched Gemini embedding endpoint.
interface BatchEmbeddingResponse {
  embeddings: Array<{
    values: number[]; // Set of vector float arrays matching request count.
  }>;
}

// Convert a single block of text into a vector representation.
export const embedText = async (text: string): Promise<number[]> => {
  // Ensure we have access to the API key before calling.
  if (!API_CONFIG.GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing');
  }

  const url = `${API_CONFIG.GEMINI_API_URL}/models/${API_CONFIG.GEMINI_EMBEDDING_MODEL}:embedContent?key=${API_CONFIG.GEMINI_API_KEY}`;

  try {
    // Send single text segment to Gemini embedding model.
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: `models/${API_CONFIG.GEMINI_EMBEDDING_MODEL}`,
        content: {
          parts: [{ text }],
        },
        outputDimensionality: 768, // Hardcode output dimensionality to match pgvector.
      }),
    });

    // Check for HTTP errors and parse response message.
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Embedding API error: ${error.error?.message || response.statusText}`);
    }

    const data: EmbeddingResponse = await response.json();
    return data.embedding.values;
  } catch (error) {
    console.error('Error in embedText:', error);
    throw error;
  }
};

// Convert a list of text segments into vectors, matching Gemini's 100-item batch limit.
export const embedBatch = async (texts: string[]): Promise<number[][]> => {
  if (!API_CONFIG.GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing');
  }

  // Split target list into chunks of 100 to stay within API rate constraints.
  const chunks = [];
  for (let i = 0; i < texts.length; i += 100) {
    chunks.push(texts.slice(i, i + 100));
  }

  const allEmbeddings: number[][] = [];

  // Call the API sequentially for each chunk list.
  for (const chunk of chunks) {
    const url = `${API_CONFIG.GEMINI_API_URL}/models/${API_CONFIG.GEMINI_EMBEDDING_MODEL}:batchEmbedContents?key=${API_CONFIG.GEMINI_API_KEY}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: chunk.map(text => ({
            model: `models/${API_CONFIG.GEMINI_EMBEDDING_MODEL}`,
            content: {
              parts: [{ text }],
            },
            outputDimensionality: 768,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Batch embedding API error: ${error.error?.message || response.statusText}`);
      }

      const data: BatchEmbeddingResponse = await response.json();
      allEmbeddings.push(...data.embeddings.map(e => e.values));
    } catch (error) {
      console.error('Error in embedBatch:', error);
      throw error;
    }
  }

  return allEmbeddings;
};
