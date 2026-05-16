import pg8000.native

# Database connection details
user = "postgres"
password = "Bk53tt3xyRuxTntb"
host = "db.ywyxefzfhkbswaafeslp.supabase.co"
port = 6543
database = "postgres"

try:
    import ssl
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    con = pg8000.native.Connection(
        user=user,
        password=password,
        host=host,
        port=5432,
        database=database,
        ssl_context=ssl_context
    )
    
    print("Connected to Supabase DB.")

    # SQL to update column and function
    sql = """
    -- 1. Alter the column type to 3072
    ALTER TABLE knowledge_chunks ALTER COLUMN embedding TYPE vector(3072);
    
    -- 2. Update the match_knowledge_chunks function
    CREATE OR REPLACE FUNCTION match_knowledge_chunks(
      query_embedding vector(3072),
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
        1 - (kc.embedding <=> query_embedding) AS similarity
      FROM knowledge_chunks kc
      WHERE 
        kc.user_id = filter_user_id
        AND 1 - (kc.embedding <=> query_embedding) > match_threshold
      ORDER BY kc.embedding <=> query_embedding
      LIMIT match_count;
    END;
    $$;
    """
    
    # Execute the SQL
    con.run(sql)
    print("Schema updated successfully to 3072 dimensions.")
    
    con.close()
except Exception as e:
    print(f"Error: {e}")
