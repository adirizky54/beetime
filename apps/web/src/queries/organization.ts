import { mutationOptions } from "@tanstack/react-query";
import type { CreateOrganizationInput } from "@beetime/schema";

import { auth } from "@/lib/auth";

export const organizationQueries = {
  all: () => ["organizations"] as const,
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
