import * as v from "valibot";
import { paginationSchema } from "./utils";

const memberFilterSchema = v.object({
  search: v.optional(v.string()),
  role: v.optional(v.picklist(["owner", "admin", "member"])),
});

export const listMembersSchema = v.object({
  ...paginationSchema.entries,
  ...memberFilterSchema.entries,
});

export const listMembersAllSchema = memberFilterSchema;

// Inferred types
export type ListMembersInput = v.InferOutput<typeof listMembersSchema>;
export type ListMembersAllInput = v.InferOutput<typeof listMembersAllSchema>;
