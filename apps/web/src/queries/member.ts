import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { Member, MemberQuery } from "@beetime/schema";

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
};
