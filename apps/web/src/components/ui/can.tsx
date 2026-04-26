import type * as React from "react";

import { type Permissions, usePermission } from "@/hooks/use-permission";

interface CanProps {
  orgId: string;
  permissions: Permissions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({
  orgId,
  permissions,
  children,
  fallback = null,
}: CanProps) {
  const { data: allowed, isError, isLoading } = usePermission(orgId, permissions);

  if (isLoading) {
    return null;
  }

  if (isError || !allowed) {
    return fallback;
  }

  return children;
}
