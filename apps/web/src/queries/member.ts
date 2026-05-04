import { keepPreviousData, mutationOptions, queryOptions } from "@tanstack/react-query";
import type { Member, MemberQuery, MemberAllQuery } from "@beetime/schema";

import { auth } from "@/lib/auth";
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
  inviteKey: () => [...memberQueries.all(), "invite"] as const,
  invite: (orgId: string) =>
    mutationOptions({
      mutationKey: [...memberQueries.inviteKey(), orgId] as const,
      mutationFn: async (data: { email: string; role: Member["role"] }) => {
        const { error } = await auth.organization.inviteMember({
          email: data.email,
          role: data.role,
          organizationId: orgId,
        });
        if (error) throw error;
      },
    }),
  removeMemberKey: () => [...memberQueries.all(), "remove-member"] as const,
  removeMember: (orgId: string) =>
    mutationOptions({
      mutationKey: [...memberQueries.removeMemberKey(), orgId] as const,
      mutationFn: async (memberId: string) => {
        const { error } = await auth.organization.removeMember({
          memberIdOrEmail: memberId,
          organizationId: orgId,
        });
        if (error) throw error;
      },
    }),
  updateMemberRoleKey: () => [...memberQueries.all(), "update-member-role"] as const,
  updateMemberRole: (orgId: string) =>
    mutationOptions({
      mutationKey: [...memberQueries.updateMemberRoleKey(), orgId] as const,
      mutationFn: async (data: { memberId: string; role: Member["role"] }) => {
        const { error } = await auth.organization.updateMemberRole({
          memberId: data.memberId,
          role: data.role,
          organizationId: orgId,
        });
        if (error) throw error;
      },
    }),
};
