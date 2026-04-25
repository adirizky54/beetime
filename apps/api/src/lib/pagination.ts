import type { PgSelect } from "drizzle-orm/pg-core";

interface PaginationParams {
  page: number
  pageSize: number
}

interface PaginationMeta {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

export async function withPagination<T extends PgSelect>(
  qb: T,
  cq: Promise<number>,
  params: PaginationParams = { page: 1, pageSize: 10 },
): Promise<PaginatedResult<Awaited<T>[number]>> {
  const { page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    qb.limit(pageSize).offset(offset),
    cq,
  ]);

  const pageCount = Math.ceil(total / pageSize) || 1;

  return {
    data: rows as Awaited<T>[number][],
    meta: {
      page,
      pageSize,
      pageCount,
      total,
    },
  };
}