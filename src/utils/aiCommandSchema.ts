import { z } from 'zod';

// Base schemas for common data types
const TaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  completed: z.enum(["due", "completed"]).optional().default("due"),
});

const NoteSchema = z.object({
  title: z.string().min(1, "Note title is required"),
  content: z.string().min(1, "Note content is required"),
  tags: z.array(z.string()).optional().default([]),
  starred: z.boolean().optional().default(false),
  pinned: z.boolean().optional().default(false),
});

const EventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  date: z.string().min(1, "Event date is required"),
  time: z.string().min(1, "Event time is required"),
});

// Schema for create operations
const CreateDataSchema = z.object({
  task: TaskSchema.optional(),
  note: NoteSchema.optional(),
  event: EventSchema.optional(),
});

// Schema for update operations
const UpdateDataSchema = z.object({
  id: z.string().min(1, "ID is required for updates"),
  task: TaskSchema.partial().optional(),
  note: NoteSchema.partial().optional(),
  event: EventSchema.partial().optional(),
});

// Schema for delete operations
const DeleteDataSchema = z.object({
  id: z.string().min(1, "ID is required for deletion"),
});

// Schema for read operations
const ReadDataSchema = z.object({
  type: z.enum(["task", "note", "event"]).optional(),
  id: z.string().optional(),
  filter: z.object({
    starred: z.boolean().optional(),
    pinned: z.boolean().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    completed: z.enum(["due", "completed"]).optional(),
  }).optional(),
});

// Schema for chat operations
const ChatDataSchema = z.object({
  message: z.string().min(1, "Chat message is required"),
});

// Main AI command schema
export const AICommandSchema = z.object({
  action: z.enum(["create", "read", "update", "delete", "chat"]),
  type: z.enum(["task", "note", "event", "general"]),
  data: z.union([CreateDataSchema, UpdateDataSchema, DeleteDataSchema, ReadDataSchema, ChatDataSchema]),
});

// Type exports for TypeScript
export type AICommand = z.infer<typeof AICommandSchema>;
export type CreateData = z.infer<typeof CreateDataSchema>;
export type UpdateData = z.infer<typeof UpdateDataSchema>;
export type DeleteData = z.infer<typeof DeleteDataSchema>;
export type ReadData = z.infer<typeof ReadDataSchema>;
export type ChatData = z.infer<typeof ChatDataSchema>;

// Validation function with detailed error messages
export const validateAICommand = (input: unknown): AICommand => {
  const result = AICommandSchema.safeParse(input);
  if (!result.success) {
    const errorMessages = result.error.issues.map(err => 
      `${err.path.join('.')}: ${err.message}`
    ).join(', ');
    throw new Error(`Invalid AI command structure: ${errorMessages}`);
  }
  return result.data;
};

// Helper function to create repair prompts for invalid responses
export const createRepairPrompt = (originalPrompt: string, validationError: string): string => {
  return `Your previous response was invalid. Please fix the following issues and respond with ONLY valid JSON:

${validationError}

Original user request: "${originalPrompt}"

Respond with a JSON object that has this exact structure:
{
  "action": "create|read|update|delete",
  "type": "task|note|event", 
  "data": { ... }
}

Do not include any explanations, markdown formatting, or text outside the JSON object.`;
};
