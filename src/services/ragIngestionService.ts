// RAG Ingestion Orchestrator — Manages the pipeline to extract, chunk, embed, and sync user content with pgvector.

import { supabase } from './supabase';
import * as chunkingService from './ragChunkingService';
import * as embeddingService from './ragEmbeddingService';
import { getNotes, getNoteById } from '../hooks/useNotes';
import { getTasks, getTaskById } from '../hooks/useTasks';
import { getEvents } from '../hooks/useEvents';

// Extract, chunk, embed, and upsert a single item into the vector store database.
export const ingestItem = async (
  userId: string,
  sourceType: 'note' | 'task' | 'event',
  sourceId: string
) => {
  try {
    let chunks: chunkingService.ChunkData[] = [];

    if (sourceType === 'note') {
      const note = await getNoteById(sourceId);
      if (note) chunks = chunkingService.chunkNote(note);
    } else if (sourceType === 'task') {
      const task = await getTaskById(sourceId);
      if (task) chunks = chunkingService.chunkTask(task);
    } else if (sourceType === 'event') {
      const { data: event } = await supabase.from('events').select('*').eq('id', sourceId).single();
      if (event) chunks = chunkingService.chunkEvent(event);
    }

    if (chunks.length === 0) return;

    await removeItem(sourceId);

    const contents = chunks.map(c => c.content);
    const embeddings = await embeddingService.embedBatch(contents);

    const rows = chunks.map((chunk, i) => ({
      user_id: userId,
      source_type: chunk.sourceType,
      source_id: chunk.sourceId,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      embedding: embeddings[i],
      metadata: chunk.metadata,
    }));

    const { error } = await supabase.from('knowledge_chunks').upsert(rows);
    if (error) throw error;

  } catch (error) {
    console.error(`RAG Ingestion Error [${sourceType}:${sourceId}]:`, error);
  }
};

// Purge all vector chunk rows matching the specified source ID.
export const removeItem = async (sourceId: string) => {
  await supabase
    .from('knowledge_chunks')
    .delete()
    .eq('source_id', sourceId);
};

// Non-blocking wrapper to trigger RAG vector index updates
export const silentIngest = (userId: string, type: 'note' | 'task' | 'event', id: string) => {
  ingestItem(userId, type, id).catch(err => console.error("RAG Ingestion Error:", err));
};

// Non-blocking wrapper to purge deprecated vector records
export const silentRemove = (id: string) => {
  removeItem(id).catch(err => console.error("RAG Removal Error:", err));
};

export const ingestAllForUser = async (
  userId: string,
  onProgress?: (pct: number) => void
) => {
  try {
    const [notes, tasks, events] = await Promise.all([
      getNotes(userId),
      getTasks(userId),
      getEvents(userId),
    ]);

    const totalItems = notes.length + tasks.length + events.length;
    let processedItems = 0;

    const reportProgress = () => {
      processedItems++;
      if (onProgress) {
        onProgress(Math.round((processedItems / totalItems) * 100));
      }
    };

    const collections = [
      { type: 'note' as const, items: notes },
      { type: 'task' as const, items: tasks },
      { type: 'event' as const, items: events },
    ];

    for (const collection of collections) {
      for (const item of collection.items) {
        await ingestItem(userId, collection.type, item.id);
        reportProgress();
      }
    }

  } catch (error) {
    console.error('Error during full ingestion:', error);
    throw error;
  }
};
