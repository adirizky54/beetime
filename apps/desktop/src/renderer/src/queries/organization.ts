import { queryOptions } from "@tanstack/react-query";

import { auth } from "@/lib/auth";

export const organizationQueries = {
  all: () => ["organizations"] as const,
  listKey: () => [...organizationQueries.all(), "list"] as const,
  list: () =>
    queryOptions({
      queryKey: organizationQueries.listKey(),
      queryFn: async () => {
        const { data, error } = await auth.organization.list();
        if (error) throw error;
        return data;
      },
    }),
};
