import { API_CONFIG } from '../config/api';

/**
 * Service to handle calling the Gemini embedding API.
 * Converts text into 768-dimensional vectors using text-embedding-004.
 */

interface EmbeddingResponse {
  embedding: {
    values: number[];
  };
}

interface BatchEmbeddingResponse {
  embeddings: Array<{
    values: number[];
  }>;
}

export const embedText = async (text: string): Promise<number[]> => {
  if (!API_CONFIG.GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing');
  }

  const url = `${API_CONFIG.GEMINI_API_URL}/models/${API_CONFIG.GEMINI_EMBEDDING_MODEL}:embedContent?key=${API_CONFIG.GEMINI_API_KEY}`;

  try {
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
        outputDimensionality: 768,
      }),
    });

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

export const embedBatch = async (texts: string[]): Promise<number[][]> => {
  if (!API_CONFIG.GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing');
  }

  // Gemini batch limit is 100 per request
  const chunks = [];
  for (let i = 0; i < texts.length; i += 100) {
    chunks.push(texts.slice(i, i + 100));
  }

  const allEmbeddings: number[][] = [];

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
