import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { Project, ProjectQuery } from "@beetime/schema";

import { api } from "@/lib/api";

export const projectQueries = {
  all: () => ["projects"] as const,
  listKey: () => [...projectQueries.all(), "list"] as const,
  list: (orgId: string, searchParams: ProjectQuery) =>
    queryOptions({
      queryKey: [...projectQueries.listKey(), orgId, searchParams] as const,
      queryFn: async ({ signal }) =>
        await api.get<Array<Project>>(`v1/organizations/${orgId}/projects`, {
          searchParams,
          signal,
        }),
      placeholderData: keepPreviousData,
    }),
};
