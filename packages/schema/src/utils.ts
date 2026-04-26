import * as v from "valibot";

export const PaginationSchema = v.object({
  page: v.optional(v.number(), 1),
  pageSize: v.optional(v.number(), 10),
});

export type Pagination = v.InferOutput<typeof PaginationSchema>;