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

    // Fetch and chunk the target entity based on its type.
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

    // Terminate pipeline early if no data or content could be parsed.
    if (chunks.length === 0) return;

    // Remove obsolete vector chunks associated with this database record.
    await removeItem(sourceId);

    // Call the embedding API to generate vectors for all chunks.
    const contents = chunks.map(c => c.content);
    const embeddings = await embeddingService.embedBatch(contents);

    // Map content chunks to pgvector database columns.
    const rows = chunks.map((chunk, i) => ({
      user_id: userId,
      source_type: chunk.sourceType,
      source_id: chunk.sourceId,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      embedding: embeddings[i],
      metadata: chunk.metadata,
    }));

    // Upsert the vector records back into Supabase.
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

// Orchestrate a full RAG synchronization for all of a user's database records.
export const ingestAllForUser = async (
  userId: string,
  onProgress?: (pct: number) => void
) => {
  try {
    // Query notes, tasks, and calendar events in parallel.
    const [notes, tasks, events] = await Promise.all([
      getNotes(userId),
      getTasks(userId),
      getEvents(userId),
    ]);

    const totalItems = notes.length + tasks.length + events.length;
    let processedItems = 0;

    // Helper function to update percentage progress callback.
    const reportProgress = () => {
      processedItems++;
      if (onProgress) {
        onProgress(Math.round((processedItems / totalItems) * 100));
      }
    };

    // Sequential RAG ingestion for Notes.
    for (const note of notes) {
      await ingestItem(userId, 'note', note.id);
      reportProgress();
    }

    // Sequential RAG ingestion for Tasks.
    for (const task of tasks) {
      await ingestItem(userId, 'task', task.id);
      reportProgress();
    }

    // Sequential RAG ingestion for Events.
    for (const event of events) {
      await ingestItem(userId, 'event', event.id);
      reportProgress();
    }

  } catch (error) {
    console.error('Error during full ingestion:', error);
    throw error;
  }
};
