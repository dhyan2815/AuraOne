// Structured AI command schemas — Validates JSON payloads for create, read, update, and delete actions.

import { z } from 'zod';

// Define the validation schema for Task creation and structure.
const TaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  completed: z.enum(["due", "completed"]).optional().default("due"),
});

// Define the validation schema for Note creation and structure.
const NoteSchema = z.object({
  title: z.string().min(1, "Note title is required"),
  content: z.string().min(1, "Note content is required"),
  tags: z.array(z.string()).optional().default([]),
  starred: z.boolean().optional().default(false),
  pinned: z.boolean().optional().default(false),
});

// Define the validation schema for Calendar Event creation and structure.
const EventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  date: z.string().min(1, "Event date is required"),
  time: z.string().min(1, "Event time is required"),
});

// Define payload container schema for creating a task, note, or event.
const CreateDataSchema = z.object({
  task: TaskSchema.optional(),
  note: NoteSchema.optional(),
  event: EventSchema.optional(),
});

// Define payload container schema for updating an existing task, note, or event.
const UpdateDataSchema = z.object({
  id: z.string().min(1, "ID is required for updates"),
  task: TaskSchema.partial().optional(), // Allow partial fields in updates.
  note: NoteSchema.partial().optional(),
  event: EventSchema.partial().optional(),
});

// Define payload container schema for deleting an entity by its database ID.
const DeleteDataSchema = z.object({
  id: z.string().min(1, "ID is required for deletion"),
});

// Define schema for read queries, supporting optional filters and direct ID access.
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

// Define schema for general chat messages that do not trigger CRUD updates.
const ChatDataSchema = z.object({
  message: z.string().min(1, "Chat message is required"),
});

// Discriminated union of command schemas, structured by the 'action' field to enforce payload shapes.
export const AICommandSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    type: z.enum(["task", "note", "event"]),
    data: CreateDataSchema,
  }),
  z.object({
    action: z.literal("read"),
    type: z.enum(["task", "note", "event"]),
    data: ReadDataSchema,
  }),
  z.object({
    action: z.literal("update"),
    type: z.enum(["task", "note", "event"]),
    data: UpdateDataSchema,
  }),
  z.object({
    action: z.literal("delete"),
    type: z.enum(["task", "note", "event"]),
    data: DeleteDataSchema,
  }),
  z.object({
    action: z.literal("chat"),
    type: z.literal("general"),
    data: ChatDataSchema,
  }),
]);

// Export generated TypeScript types inferred from the Zod schemas.
export type AICommand = z.infer<typeof AICommandSchema>;
export type CreateData = z.infer<typeof CreateDataSchema>;
export type UpdateData = z.infer<typeof UpdateDataSchema>;
export type DeleteData = z.infer<typeof DeleteDataSchema>;
export type ReadData = z.infer<typeof ReadDataSchema>;
export type ChatData = z.infer<typeof ChatDataSchema>;

// Validate incoming AI JSON command structure and raise detailed error messages on mismatch.
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

// Formulate a recovery prompt containing Zod validation failures to self-heal malformed LLM responses.
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
