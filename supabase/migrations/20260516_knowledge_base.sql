-- RAG Knowledge Base Schema — Establishes pgvector extensions, tables, indexing, and vector similarity retrieval functions.

-- Enable pgvector extension for high-performance vector operations.
CREATE EXTENSION IF NOT EXISTS vector;

-- Store raw text chunks alongside their 768-dimensional embeddings.
CREATE TABLE knowledge_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Cascades cleanup on account deletion.
  source_type TEXT NOT NULL CHECK (source_type IN ('note', 'task', 'event')), -- Restricts source categories.
  source_id UUID NOT NULL, -- Identifies the source entity.
  chunk_index INTEGER NOT NULL DEFAULT 0, -- Order of the chunk in the document.
  content TEXT NOT NULL, -- Plaintext snippet chunk content.
  embedding vector(768),  -- Gemini text-embedding-001 outputs 768 dimensions.
  metadata JSONB DEFAULT '{}', -- Structured metadata for query filtering.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(source_id, chunk_index) -- Prevents duplicate chunks for the same index.
);

-- Define HNSW index for high-speed approximate nearest-neighbor similarity searches.
CREATE INDEX knowledge_chunks_embedding_idx 
  ON knowledge_chunks 
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Define lookup indexes to optimize relational user filtering and source lookups.
CREATE INDEX knowledge_chunks_user_id_idx ON knowledge_chunks(user_id);
CREATE INDEX knowledge_chunks_source_idx ON knowledge_chunks(source_type, source_id);

-- Enforce tenant separation using Postgres Row Level Security.
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Allow users to only access, write, and delete database rows associated with their user_id.
CREATE POLICY "Users can read own chunks" ON knowledge_chunks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chunks" ON knowledge_chunks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chunks" ON knowledge_chunks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chunks" ON knowledge_chunks
  FOR DELETE USING (auth.uid() = user_id);

-- Perform cosine similarity vector match against user chunks using the <=> operator.
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  filter_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  source_type TEXT,
  source_id UUID,
  chunk_index INTEGER,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.source_type,
    kc.source_id,
    kc.chunk_index,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) AS similarity -- Calculate similarity score from cosine distance.
  FROM knowledge_chunks kc
  WHERE 
    kc.user_id = filter_user_id
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold -- Filter below similarity threshold.
  ORDER BY kc.embedding <=> query_embedding -- Order by closest vector match.
  LIMIT match_count;
END;
$$;
