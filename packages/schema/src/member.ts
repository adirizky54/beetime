import * as v from "valibot";
import { PaginationSchema } from "./utils";

export const MemberSchema = v.object({
  id: v.string(),
  name: v.string(),
  email: v.string(),
  role: v.picklist(["owner", "admin", "member"]),
  image: v.nullable(v.string()),
  createdAt: v.string(),
  banned: v.boolean(),
});

export const MemberQuerySchema = v.object({
  ...PaginationSchema.entries,
  search: v.optional(v.string()),
  role: v.optional(v.picklist(["all", "owner", "admin", "member"]), "all"),
});

export const MemberAllQuerySchema = v.object({
  search: v.optional(v.string()),
  role: v.optional(v.picklist(["all", "owner", "admin", "member"]), "all"),
});

export type Member = v.InferOutput<typeof MemberSchema>;
export type MemberQuery = v.InferOutput<typeof MemberQuerySchema>;
export type MemberAllQuery = v.InferOutput<typeof MemberAllQuerySchema>;
