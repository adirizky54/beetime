import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { Member, MemberQuery, MemberAllQuery } from "@beetime/schema";

import { api } from "@/lib/api";

export const memberQueries = {
  all: () => ["members"] as const,
  listKey: () => [...memberQueries.all(), "list"] as const,
  list: (orgId: string, searchParams: MemberQuery) =>
    queryOptions({
      queryKey: [...memberQueries.listKey(), orgId, searchParams] as const,
      queryFn: async ({ signal }) => {
        return await api.get<Array<Member>>(`v1/organizations/${orgId}/members`, {
          searchParams,
          signal,
        });
      },
      placeholderData: keepPreviousData,
    }),
  listAllKey: () => [...memberQueries.all(), "list-all"] as const,
  listAll: (orgId: string, searchParams?: MemberAllQuery) =>
    queryOptions({
      queryKey: [...memberQueries.listAllKey(), orgId, searchParams] as const,
      queryFn: async ({ signal }) => {
        return await api.get<Array<Member>>(`v1/organizations/${orgId}/members/all`, {
          searchParams,
          signal,
        });
      },
    }),
};
