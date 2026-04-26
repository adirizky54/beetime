import { useQuery } from "@tanstack/react-query";
import { type Permissions, authQueries } from "@/queries/auth";

export type { Permissions };

export function usePermission(orgId: string, permissions: Permissions) {
  return useQuery(authQueries.hasPermission(orgId, permissions));
}
