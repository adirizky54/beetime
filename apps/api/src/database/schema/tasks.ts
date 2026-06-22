import { relations } from "drizzle-orm";
import { date, pgEnum, pgTable, text, timestamp, uuid, index, primaryKey } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./users";

export const taskPriorityEnum = pgEnum("task_priority_enum", ["low", "medium", "high", "urgent"]);

export const taskStateEnum = pgEnum("task_state_enum", [
  "backlog",
  "todo",
  "in_progress",
  "done",
  "blocked",
  "cancelled",
]);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    description: text("description"),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    startDate: date("start_date"),
    endDate: date("end_date"),
    priority: taskPriorityEnum("priority"),
    state: taskStateEnum("state").default("backlog").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("tasks_project_id_idx").on(table.projectId)],
);

export const taskAssignees = pgTable(
  "task_assignees",
  {
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.taskId, table.userId] }),
    index("task_assignees_task_id_idx").on(table.taskId),
    index("task_assignees_user_id_idx").on(table.userId),
  ],
);

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignees: many(taskAssignees),
}));

export const taskAssigneesRelations = relations(taskAssignees, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignees.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskAssignees.userId],
    references: [users.id],
  }),
}));
