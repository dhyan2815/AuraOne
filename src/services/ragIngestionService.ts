import { supabase } from './supabase';
import * as chunkingService from './ragChunkingService';
import * as embeddingService from './ragEmbeddingService';
import { getNotes, getNoteById } from '../hooks/useNotes';
import { getTasks, getTaskById } from '../hooks/useTasks';
import { getEvents } from '../hooks/useEvents'; // Assuming getEventById might be needed or just get all

/**
 * Service to orchestrate the ingestion pipeline: extract -> chunk -> embed -> store.
 */

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
      // For events, we might need a getEventById or just use the current data if passed
      // For now, let's assume we fetch all and find it, or we'll add getEventById later
      const { data: event } = await supabase.from('events').select('*').eq('id', sourceId).single();
      if (event) chunks = chunkingService.chunkEvent(event);
    }

    if (chunks.length === 0) return;

    // Remove existing chunks for this item
    await removeItem(sourceId);

    // Embed and store
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

export const removeItem = async (sourceId: string) => {
  await supabase
    .from('knowledge_chunks')
    .delete()
    .eq('source_id', sourceId);
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

    // Process notes
    for (const note of notes) {
      await ingestItem(userId, 'note', note.id);
      reportProgress();
    }

    // Process tasks
    for (const task of tasks) {
      await ingestItem(userId, 'task', task.id);
      reportProgress();
    }

    // Process events
    for (const event of events) {
      await ingestItem(userId, 'event', event.id);
      reportProgress();
    }

  } catch (error) {
    console.error('Error during full ingestion:', error);
    throw error;
  }
};
