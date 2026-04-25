import * as v from "valibot";

export const createTaskSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Task name cannot be empty")),
});

export const updateTaskSchema = createTaskSchema;

// Inferred types
export type CreateTaskInput = v.InferOutput<typeof createTaskSchema>;
export type UpdateTaskInput = v.InferOutput<typeof updateTaskSchema>;
