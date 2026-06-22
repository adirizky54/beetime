import * as v from "valibot";
import { PaginationSchema } from "./utils";

export const TaskPrioritySchema = v.picklist(["low", "medium", "high", "urgent"]);

export const TaskStateSchema = v.picklist(["backlog", "todo", "in_progress", "done", "blocked", "cancelled"]);

export const TaskAssigneeSchema = v.object({
  id: v.string(),
  name: v.string(),
  image: v.nullable(v.string()),
});

export const TaskSchema = v.object({
  id: v.string(),
  name: v.string(),
  description: v.nullable(v.string()),
  projectId: v.nullable(v.string()),
  priority: v.nullable(TaskPrioritySchema),
  state: TaskStateSchema,
  assignees: v.array(TaskAssigneeSchema),
  createdAt: v.string(),
  updatedAt: v.string(),
});

export const CreateTaskSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Task name cannot be empty")),
  description: v.optional(v.string()),
  priority: v.optional(TaskPrioritySchema),
  state: v.optional(TaskStateSchema),
  assigneeIds: v.optional(v.array(v.string())),
});

export const UpdateTaskSchema = v.partial(
  v.object({
    name: v.pipe(v.string(), v.nonEmpty("Task name cannot be empty")),
    description: v.nullable(v.string()),
    priority: v.nullable(TaskPrioritySchema),
    state: TaskStateSchema,
  }),
);

export const TaskAssigneesBodySchema = v.object({
  userIds: v.array(v.pipe(v.string(), v.nonEmpty("User ID cannot be empty"))),
});

export const TaskQuerySchema = v.object({
  ...PaginationSchema.entries,
  search: v.optional(v.string()),
  state: v.optional(v.array(TaskStateSchema)),
  priority: v.optional(v.array(TaskPrioritySchema)),
});

export type Task = v.InferOutput<typeof TaskSchema>;
export type TaskAssignee = v.InferOutput<typeof TaskAssigneeSchema>;
export type CreateTaskInput = v.InferOutput<typeof CreateTaskSchema>;
export type UpdateTaskInput = v.InferOutput<typeof UpdateTaskSchema>;
export type TaskAssigneesBody = v.InferOutput<typeof TaskAssigneesBodySchema>;
export type TaskQuery = v.InferOutput<typeof TaskQuerySchema>;
