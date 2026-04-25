import * as v from "valibot";
import { paginationSchema } from "./utils";

export const listClientsSchema = v.object({
  ...paginationSchema.entries,
  search: v.optional(v.string()),
  status: v.optional(v.picklist(["active", "archived", "all"]), "active"),
});

export const createClientSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, "Client name is required"), v.maxLength(255, "Client name must not exceed 255 characters")),
  email: v.nullish(
    v.pipe(
      v.string(),
      v.email("Please enter a valid email address"),
    ),
  ),
  phone: v.nullish(v.string()),
  address: v.nullish(v.pipe(v.string(), v.maxLength(500, "Address must not exceed 500 characters"))),
});

export const getClientSchema = v.object({
  id: v.pipe(v.string(), v.uuid("Invalid client ID format")),
});

export const updateClientSchema = createClientSchema;

// Inferred types
export type ListClientsInput = v.InferOutput<typeof listClientsSchema>;
export type CreateClientInput = v.InferOutput<typeof createClientSchema>;
export type GetClientInput = v.InferOutput<typeof getClientSchema>;
export type UpdateClientInput = v.InferOutput<typeof updateClientSchema>;
