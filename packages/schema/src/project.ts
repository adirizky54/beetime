import * as v from "valibot";
import { MemberSchema } from "./member";
import { PaginationSchema } from "./utils";

export const ProjectSchema = v.object({
  id: v.string(),
  name: v.string(),
  description: v.nullable(v.string()),
  organizationId: v.string(),
  clientId: v.nullable(v.string()),
  client: v.nullable(
    v.object({
      id: v.string(),
      name: v.string(),
    }),
  ),
  privacy: v.picklist(["private", "public"]),
  members: v.array(v.pick(MemberSchema, ["id", "name", "image"])),
  createdBy: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  archivedAt: v.nullable(v.string()),
});

export const CreateProjectSchema = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.trim(), v.nonEmpty("Project name must not be empty")),
    description: v.optional(v.string()),
    clientId: v.nullable(v.string()),
    privacy: v.picklist(["public", "private"]),
    userIds: v.array(v.string()),
  }),
  v.forward(
    v.check((input) => input.privacy !== "private" || input.userIds.length > 0, "Please select at least one member"),
    ["userIds"],
  ),
);

export const UpdateProjectSchema = v.pipe(
  v.object({
    name: v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty("Project name must not be empty"))),
    description: v.optional(v.string()),
    clientId: v.optional(v.nullable(v.string())),
    privacy: v.optional(v.picklist(["public", "private"])),
    userIds: v.optional(v.array(v.string())),
  }),
  v.forward(
    v.check(
      (input) => input.privacy !== "private" || (input.userIds ?? []).length > 0,
      "Please select at least one member",
    ),
    ["userIds"],
  ),
);

export const ProjectQuerySchema = v.object({
  ...PaginationSchema.entries,
  search: v.optional(v.string()),
  status: v.optional(v.picklist(["all", "active", "archived"]), "all"),
  clientId: v.optional(v.string()),
});

export type Project = v.InferOutput<typeof ProjectSchema>;
export type CreateProjectInput = v.InferOutput<typeof CreateProjectSchema>;
export type UpdateProjectInput = v.InferOutput<typeof UpdateProjectSchema>;
export type ProjectQuery = v.InferOutput<typeof ProjectQuerySchema>;
