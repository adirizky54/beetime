import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { CreateTaskInput, TaskQuery, UpdateTaskInput } from "@beetime/schema";

import { taskAssignees, tasks, users } from "@/database/schema";
import { db } from "@/lib/db";
import { withPagination } from "@/lib/pagination";

export async function listTasks(projectId: string, query: TaskQuery) {
  const conditions = [eq(tasks.projectId, projectId)];

  if (query.state && query.state.length > 0) {
    conditions.push(inArray(tasks.state, query.state));
  }

  if (query.priority && query.priority.length > 0) {
    conditions.push(inArray(tasks.priority, query.priority));
  }

  if (query.search) {
    const searchPattern = `%${query.search}%`;
    conditions.push(ilike(tasks.name, searchPattern));
  }

  const taskList = db
    .select({
      id: tasks.id,
      name: tasks.name,
      description: tasks.description,
      startDate: tasks.startDate,
      endDate: tasks.endDate,
      projectId: tasks.projectId,
      priority: tasks.priority,
      state: tasks.state,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      assignees: sql<{ id: string; name: string; image: string | null }[]>`
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', ${users.id}, 'name', ${users.name}, 'image', ${users.image}))
            FROM ${taskAssignees}
            JOIN ${users} ON ${taskAssignees.userId} = ${users.id}
            WHERE ${taskAssignees.taskId} = ${tasks.id}
          ),
          '[]'::json
        )
      `,
    })
    .from(tasks)
    .where(and(...conditions))
    .orderBy(desc(tasks.createdAt))
    .$dynamic();

  const taskCount = db.$count(tasks, and(...conditions));

  const result = await withPagination(taskList, taskCount, {
    page: query.page,
    pageSize: query.pageSize,
  });

  return result;
}

export async function getTask(projectId: string, taskId: string) {
  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)),
    with: {
      assignees: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    throw new HTTPException(404, { message: "Task not found" });
  }

  return task;
}

export async function createTask(projectId: string, data: CreateTaskInput) {
  const task = await db.transaction(async (tx) => {
    const [newTask] = await tx
      .insert(tasks)
      .values({
        projectId,
        name: data.name,
        description: data.description ?? null,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        priority: data.priority ?? null,
        state: data.state ?? "backlog",
      })
      .returning();

    if (data.assigneeIds && data.assigneeIds.length > 0) {
      await tx
        .insert(taskAssignees)
        .values(
          data.assigneeIds.map((userId) => ({
            taskId: newTask.id,
            userId,
          })),
        )
        .onConflictDoNothing();
    }

    return newTask;
  });

  return task;
}

export async function updateTask(projectId: string, taskId: string, data: UpdateTaskInput) {
  const existing = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)),
  });

  if (!existing) {
    throw new HTTPException(404, { message: "Task not found" });
  }

  const [updated] = await db
    .update(tasks)
    .set(data)
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
    .returning();

  return updated;
}

export async function deleteTask(projectId: string, taskId: string) {
  const existing = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)),
  });

  if (!existing) {
    throw new HTTPException(404, { message: "Task not found" });
  }

  await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)));
}

export async function setTaskAssignees(projectId: string, taskId: string, userIds: string[]) {
  const existing = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)),
  });

  if (!existing) {
    throw new HTTPException(404, { message: "Task not found" });
  }

  await db.transaction(async (tx) => {
    await tx.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));

    if (userIds.length > 0) {
      await tx
        .insert(taskAssignees)
        .values(userIds.map((userId) => ({ taskId, userId })))
        .onConflictDoNothing();
    }
  });
}
