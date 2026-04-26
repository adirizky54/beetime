import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { CreateTaskInput, UpdateTaskInput } from "@beetime/schema";

import { tasks } from "@/database/schema";
import { db } from "@/lib/db";

export async function listTasks(projectId: string) {
  const tasksList = await db.query.tasks.findMany({
    where: eq(tasks.projectId, projectId),
  });

  return tasksList;
}

export async function getTask(projectId: string, taskId: string) {
  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)),
  });

  if (!task) {
    throw new HTTPException(404, { message: "Task not found" });
  }

  return task;
}

export async function createTask(
  projectId: string,
  data: CreateTaskInput
) {
  const [task] = await db
    .insert(tasks)
    .values({
      projectId,
      name: data.name,
    })
    .returning();

  return task;
}

export async function updateTask(
  projectId: string,
  taskId: string,
  data: UpdateTaskInput
) {
  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)),
  });

  if (!task) {
    throw new HTTPException(404, { message: "Task not found" });
  }

  const [updated] = await db
    .update(tasks)
    .set(data)
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
    .returning();

  return updated;
}

export async function deleteTask(
  projectId: string,
  taskId: string
) {
  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)),
  });

  if (!task) {
    throw new HTTPException(404, { message: "Task not found" });
  }

  await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)));
}

export async function markTaskDone(
  projectId: string,
  taskId: string
) {
  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)),
  });

  if (!task) {
    throw new HTTPException(404, { message: "Task not found" });
  }

  const [updated] = await db
    .update(tasks)
    .set({ doneAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
    .returning();

  return updated;
}

export async function markTaskUndone(
  projectId: string,
  taskId: string
) {
  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)),
  });

  if (!task) {
    throw new HTTPException(404, { message: "Task not found" });
  }

  const [updated] = await db
    .update(tasks)
    .set({ doneAt: null })
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
    .returning();

  return updated;
}
