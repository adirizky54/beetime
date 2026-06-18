import { mutationOptions, queryOptions } from "@tanstack/react-query";

import { auth } from "@/lib/auth";

export const invitationQueries = {
  all: () => ["invitations"] as const,
  listKey: (orgId: string) => [...invitationQueries.all(), "list", orgId] as const,
  list: (orgId: string) =>
    queryOptions({
      queryKey: invitationQueries.listKey(orgId),
      queryFn: async () => {
        const { data, error } = await auth.organization.listInvitations({
          query: { organizationId: orgId },
        });
        if (error) throw error;
        return data;
      },
    }),
  getKey: (token: string) => [...invitationQueries.all(), "get", token] as const,
  get: (token: string) =>
    queryOptions({
      queryKey: invitationQueries.getKey(token),
      queryFn: async () => {
        const { data, error } = await auth.organization.getInvitation({ query: { id: token } });
        if (error) throw error;
        if (!data) throw new Error("Invitation not found.");
        return data;
      },
      retry: false,
    }),
  cancelKey: () => [...invitationQueries.all(), "cancel"] as const,
  cancel: (orgId: string) =>
    mutationOptions({
      mutationKey: [...invitationQueries.cancelKey(), orgId] as const,
      mutationFn: async (invitationId: string) => {
        const { error } = await auth.organization.cancelInvitation({ invitationId });
        if (error) throw error;
      },
    }),
  acceptKey: () => [...invitationQueries.all(), "accept"] as const,
  accept: () =>
    mutationOptions({
      mutationKey: invitationQueries.acceptKey(),
      mutationFn: async ({ invitationId }: { invitationId: string }) => {
        const { data, error } = await auth.organization.acceptInvitation({ invitationId });
        if (error) throw error;
        if (!data) throw new Error("Failed to accept invitation.");
        return data;
      },
    }),
  rejectKey: () => [...invitationQueries.all(), "reject"] as const,
  reject: () =>
    mutationOptions({
      mutationKey: invitationQueries.rejectKey(),
      mutationFn: async ({ invitationId }: { invitationId: string }) => {
        const { error } = await auth.organization.rejectInvitation({ invitationId });
        if (error) throw error;
      },
    }),
};
