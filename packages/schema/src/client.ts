import * as v from "valibot";
import { PaginationSchema } from "./utils";

export const ClientSchema = v.object({
  id: v.string(),
  name: v.string(),
  email: v.nullable(v.string()),
  phone: v.nullable(v.string()),
  address: v.nullable(v.string()),
  organizationId: v.string(),
  createdBy: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  archivedAt: v.nullable(v.string()),
});

export const CreateClientSchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(1, "Client name is required"),
    v.maxLength(255, "Client name must not exceed 255 characters"),
  ),
  email: v.nullish(v.pipe(v.string(), v.email("Please enter a valid email address"))),
  phone: v.nullish(v.string()),
  address: v.nullish(v.pipe(v.string(), v.maxLength(500, "Address must not exceed 500 characters"))),
});

export const UpdateClientSchema = CreateClientSchema;

export const ClientQuerySchema = v.object({
  ...PaginationSchema.entries,
  search: v.optional(v.string()),
  status: v.optional(v.picklist(["all", "active", "archived"]), "all"),
});

export const ClientAllQuerySchema = v.pick(ClientQuerySchema, ["status"]);

export type Client = v.InferOutput<typeof ClientSchema>;
export type CreateClientInput = v.InferOutput<typeof CreateClientSchema>;
export type UpdateClientInput = v.InferOutput<typeof UpdateClientSchema>;
export type ClientQuery = v.InferOutput<typeof ClientQuerySchema>;
export type ClientAllQuery = v.InferOutput<typeof ClientAllQuerySchema>;
