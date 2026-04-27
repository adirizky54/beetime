import { queryOptions } from "@tanstack/react-query";
import { auth } from "@/lib/auth";
import { type PermissionStatement } from "@/utils/permissions";

export type Permissions = {
  [R in keyof PermissionStatement]?: Array<PermissionStatement[R][number]>;
};

export const authQueries = {
  all: () => ["auth"] as const,
  permissionsKey: () => [...authQueries.all(), "permissions"] as const,
  hasPermission: (orgId: string, permissions: Permissions) =>
    queryOptions({
      queryKey: [...authQueries.permissionsKey(), orgId, JSON.stringify(permissions)] as const,
      queryFn: async () => await auth.organization.hasPermission({
        organizationId: orgId,
        permissions,
      }),
      select: (response) => response.data?.success ?? false,
    }),
};
