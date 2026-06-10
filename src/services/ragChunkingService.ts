import { Note } from '../hooks/useNotes';
import { Task } from '../hooks/useTasks';
import { Event } from '../hooks/useEvents';

export interface ChunkData {
  content: string;
  sourceType: 'note' | 'task' | 'event';
  sourceId: string;
  chunkIndex: number;
  metadata: Record<string, unknown>;
}

/**
 * Service to handle text extraction and chunking for different data types.
 */

export const chunkNote = (note: Note): ChunkData[] => {
  const chunks: ChunkData[] = [];
  const content = note.content || '';
  const title = note.title || 'Untitled Note';
  
  // Clean content: remove some basic markdown or HTML if necessary
  // For now, we'll just chunk by paragraphs or fixed length
  const fullText = `Title: ${title}\n\n${content}`;
  
  // Simple chunking logic: split by double newline (paragraphs) 
  // and ensure each chunk is within a reasonable size limit.
  // For production, a more sophisticated recursive character splitter would be better.
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
      chunkIndex: 0,
      metadata: {
        title: task.title,
        priority: task.priority,
        due_date: task.due_date,
        completed: task.completed,
      },
    },
  ];
};

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
      chunkIndex: 0,
      metadata: {
        title: event.title,
        start_time: event.start_time,
        end_time: event.end_time,
      },
    },
  ];
};
