import * as v from "valibot";
import { paginationSchema } from "./utils";

export const listProjectsSchema = v.object({
  ...paginationSchema.entries,
  search: v.optional(v.string()),
  status: v.optional(v.picklist(["active", "archived", "all"]), "active"),
  clientId: v.optional(v.pipe(v.string(), v.uuid("Invalid client ID format"))),
});

export const createProjectSchema = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.trim(), v.nonEmpty("Project name must not be empty")),
    description: v.optional(v.string()),
    clientId: v.nullish(v.pipe(v.string(), v.uuid("Invalid client ID format"))),
    privacy: v.optional(v.picklist(["public", "private"]), "public"),
    userIds: v.array(v.string()),
  }),
  v.forward(
    v.check(
      (input) => input.privacy === "private" && input.userIds.length === 0,
      "Please select at least one member",
    ),
    ["userIds"],
  ),
);

export const updateProjectSchema = v.pipe(
  v.object({
    name: v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty("Project name must not be empty"))),
    description: v.optional(v.string()),
    clientId: v.nullish(v.pipe(v.string(), v.uuid("Invalid client ID format"))),
    privacy: v.optional(v.picklist(["public", "private"])),
    userIds: v.optional(v.array(v.string())),
  }),
  v.forward(
    v.check(
      (input) => input.privacy === "private" && (input.userIds === undefined || input.userIds.length === 0),
      "Please select at least one member",
    ),
    ["userIds"],
  ),
);

// Inferred types
export type ListProjectsInput = v.InferOutput<typeof listProjectsSchema>;
export type CreateProjectInput = v.InferOutput<typeof createProjectSchema>;
export type UpdateProjectInput = v.InferOutput<typeof updateProjectSchema>;
