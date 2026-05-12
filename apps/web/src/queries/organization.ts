import { mutationOptions, queryOptions } from "@tanstack/react-query";
import type { CreateOrganizationInput, UpdateOrganizationInput } from "@beetime/schema";

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
  updateKey: (orgId: string) => [...organizationQueries.all(), "update", orgId] as const,
  update: (orgId: string) =>
    mutationOptions({
      mutationKey: organizationQueries.updateKey(orgId),
      mutationFn: async (payload: UpdateOrganizationInput) => {
        const { data, error } = await auth.organization.update({
          organizationId: orgId,
          data: payload,
        });
        if (error) throw error;
        return data;
      },
    }),
  deleteKey: (orgId: string) => [...organizationQueries.all(), "delete", orgId] as const,
  delete: (orgId: string) =>
    mutationOptions({
      mutationKey: organizationQueries.deleteKey(orgId),
      mutationFn: async () => {
        const { error } = await auth.organization.delete({ organizationId: orgId });
        if (error) throw error;
      },
    }),
};
