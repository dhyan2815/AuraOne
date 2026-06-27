// RAG Retrieval Service — Queries pgvector database using vector similarity to retrieve relevant text chunks.

import { supabase } from './supabase';
import * as embeddingService from './ragEmbeddingService';
import { getRAGConfig } from '../config/api';

// Structure of context records retrieved by similarity search.
export interface RetrievalResult {
  id: string; // Unique chunk UUID.
  content: string; // Plaintext segment content.
  sourceType: 'note' | 'task' | 'event'; // Origin table category.
  sourceId: string; // Unique ID of the parent record.
  similarity: number; // Cosine similarity coefficient (0 to 1).
  metadata: Record<string, unknown>; // Accompanying metadata payload.
}

// Embed search terms and query the pgvector database via RPC for similar context chunks.
export const retrieveContext = async (
  userId: string,
  query: string,
  topK?: number
): Promise<RetrievalResult[]> => {
  const config = getRAGConfig();
  const limit = topK || config.topK;
  
  try {
    // Generate text vector embedding for the input query string.
    const queryEmbedding = await embeddingService.embedText(query);

    // Call stored postgres function using similarity threshold and size configurations.
    const { data, error } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: config.threshold,
      match_count: limit,
      filter_user_id: userId,
    });

    if (error) {
      console.error('Error in retrieveContext RPC:', error);
      throw error;
    }

    // Format DB snake_case columns to TS camelCase parameters.
    return (data || []).map((row: { id: string; content: string; source_type: 'note' | 'task' | 'event'; source_id: string; similarity: number; metadata: Record<string, unknown> }) => ({
      id: row.id,
      content: row.content,
      sourceType: row.source_type,
      sourceId: row.source_id,
      similarity: row.similarity,
      metadata: row.metadata,
    }));

  } catch (error) {
    console.error('Error in retrieveContext:', error);
    return []; // Return empty array as fallback on search failure.
  }
};
