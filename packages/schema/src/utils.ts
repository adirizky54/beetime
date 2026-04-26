import * as v from "valibot";

export const PaginationSchema = v.object({
  page: v.optional(v.pipe(v.unknown(), v.transform(Number), v.integer(), v.minValue(1)), 1),
  pageSize: v.optional(v.pipe(v.unknown(), v.transform(Number), v.integer(), v.minValue(1)), 10),
});

export type Pagination = v.InferOutput<typeof PaginationSchema>;