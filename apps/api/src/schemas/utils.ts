import * as v from "valibot";

export const paginationSchema = v.object({
  page: v.number(),
  pageSize: v.number(),
});

export type PaginationInput = v.InferOutput<typeof paginationSchema>;