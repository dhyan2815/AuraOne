// RAG chunking service — Splits notes, tasks, and events into semantic text segments for vector indexing.

import { Note } from '../hooks/useNotes';
import { Task } from '../hooks/useTasks';
import { Event } from '../hooks/useEvents';

// Data structure representing a text chunk prepared for embedding and database storage.
export interface ChunkData {
  content: string; // The plaintext block content to embed.
  sourceType: 'note' | 'task' | 'event'; // Originating database table.
  sourceId: string; // ID of the originating database record.
  chunkIndex: number; // Order index for reassembling multi-chunk documents.
  metadata: Record<string, unknown>; // Filtering parameters passed to search queries.
}

// Segment note content by double newlines to form semantic paragraph chunks.
export const chunkNote = (note: Note): ChunkData[] => {
  const chunks: ChunkData[] = [];
  const content = note.content || '';
  const title = note.title || 'Untitled Note';
  
  // Format note with its title prefixed to give vector searches context.
  const fullText = `Title: ${title}\n\n${content}`;
  
  // Divide text by empty paragraph spaces.
  const paragraphs = fullText.split(/\n\s*\n/);
  
  paragraphs.forEach((para, index) => {
    if (para.trim()) {
      chunks.push({
        content: para.trim(),
        sourceType: 'note',
        sourceId: note.id,
        chunkIndex: index,
        metadata: {
          title: note.title,
          tags: note.tags,
          created_at: note.created_at,
        },
      });
    }
  });

  return chunks;
};

// Serialize task properties into a unified text block.
export const chunkTask = (task: Task): ChunkData[] => {
  const content = `Task: ${task.title}
Description: ${task.description || 'No description'}
Priority: ${task.priority || 'medium'}
Due Date: ${task.due_date || 'No due date'}
Status: ${task.completed ? 'Completed' : 'Active'}`;

  return [
    {
      content,
      sourceType: 'task',
      sourceId: task.id,
      chunkIndex: 0, // Tasks fit within one vector chunk.
      metadata: {
        title: task.title,
        priority: task.priority,
        due_date: task.due_date,
        completed: task.completed,
      },
    },
  ];
};

// Serialize calendar event properties into a unified text block.
export const chunkEvent = (event: Event): ChunkData[] => {
  const content = `Event: ${event.title}
Start: ${event.start_time}
End: ${event.end_time || 'No end time'}
Description: ${event.description || 'No description'}`;

  return [
    {
      content,
      sourceType: 'event',
      sourceId: event.id,
      chunkIndex: 0, // Events fit within one vector chunk.
      metadata: {
        title: event.title,
        start_time: event.start_time,
        end_time: event.end_time,
      },
    },
  ];
};
