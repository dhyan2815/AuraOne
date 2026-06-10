import { supabase } from './supabase';
import * as embeddingService from './ragEmbeddingService';
import { getRAGConfig } from '../config/api';

export interface RetrievalResult {
  id: string;
  content: string;
  sourceType: 'note' | 'task' | 'event';
  sourceId: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

/**
 * Service to handle semantic search and retrieval from the vector store.
 */

export const retrieveContext = async (
  userId: string,
  query: string,
  topK?: number
): Promise<RetrievalResult[]> => {
  const config = getRAGConfig();
  const limit = topK || config.topK;
  
  try {
    // 1. Embed the query
    const queryEmbedding = await embeddingService.embedText(query);

    // 2. Search in Supabase using the match_knowledge_chunks RPC
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

    // 3. Format and return results
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
    return [];
  }
};
