import * as v from "valibot";

export const TaskSchema = v.object({
  id: v.string(),
  name: v.string(),
  projectId: v.nullable(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
  doneAt: v.nullable(v.string()),
});

export const CreateTaskSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Task name cannot be empty")),
});

export const UpdateTaskSchema = CreateTaskSchema;

export type Task = v.InferOutput<typeof TaskSchema>;
export type CreateTaskInput = v.InferOutput<typeof CreateTaskSchema>;
export type UpdateTaskInput = v.InferOutput<typeof UpdateTaskSchema>;
