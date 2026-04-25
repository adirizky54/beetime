import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { projects } from "./projects";

export const tasks = pgTable(
  "tasks",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    doneAt: timestamp("done_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("tasks_project_id_idx").on(table.projectId),
  ],
);

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
}));
