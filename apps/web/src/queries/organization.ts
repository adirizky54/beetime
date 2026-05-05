import { mutationOptions, queryOptions } from "@tanstack/react-query";
import type { CreateOrganizationInput } from "@beetime/schema";

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
  getKey: (orgId?: string) => [...organizationQueries.all(), "get", orgId] as const,
  get: (orgId?: string, orgSlug?: string) =>
    queryOptions({
      queryKey: organizationQueries.getKey(orgId),
      queryFn: async () => {
        const { data, error } = await auth.organization.getFullOrganization({
          query: { organizationId: orgId, organizationSlug: orgSlug },
        });
        if (error) throw error;
        return data;
      },
    }),
  createKey: () => [...organizationQueries.all(), "create"] as const,
  create: () =>
    mutationOptions({
      mutationKey: organizationQueries.createKey(),
      mutationFn: async (payload: CreateOrganizationInput) => {
        const { data, error } = await auth.organization.create(payload);
        if (error) throw error;
        return data;
      },
    }),
};
