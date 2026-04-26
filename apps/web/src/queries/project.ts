import { keepPreviousData, mutationOptions, queryOptions } from "@tanstack/react-query";
import type { CreateProjectInput, Member, Project, ProjectQuery, UpdateProjectInput } from "@beetime/schema";

import { api } from "@/lib/api";

export const projectQueries = {
  all: () => ["projects"] as const,
  listKey: () => [...projectQueries.all(), "list"] as const,
  list: (orgId: string, searchParams: ProjectQuery) => 
    queryOptions({
      queryKey: [...projectQueries.listKey(), orgId, searchParams] as const,
      queryFn: async ({ signal }) => await api.get<Array<Project>>(`v1/organizations/${orgId}/projects`, {
        searchParams,
        signal
      }),
      placeholderData: keepPreviousData,
    }),
  detailkey: () => [...projectQueries.all(), "detail"] as const,
  detail: (orgId: string, projectId: string) =>
    queryOptions({
      queryKey: [...projectQueries.detailkey(), orgId, projectId] as const,
      queryFn: async ({ signal }) => await api.get<Omit<Project, "members">>(`v1/organizations/${orgId}/projects/${projectId}`, {
        signal
      }),
    }),
  listMembersKey: () => [...projectQueries.all(), "listMembers"] as const,
  listMembers: (orgId: string, projectId: string) =>
    queryOptions({
      queryKey: [...projectQueries.listMembersKey(), orgId, projectId] as const,
      queryFn: async ({ signal }) => await api.get<Array<Pick<Member, "id" | "name" | "image">>>(`v1/organizations/${orgId}/projects/${projectId}/members`, {
        signal
      }),
    }),
  createKey: () => [...projectQueries.all(), "create"] as const,
  create: (orgId: string) => 
    mutationOptions({
      mutationKey: [...projectQueries.createKey(), orgId] as const,
      mutationFn: async (data: CreateProjectInput) => await api.post<Project>(`v1/organizations/${orgId}/projects`, data),
    }),
  archiveKey: () => [...projectQueries.all(), "archive"] as const,
  archive: (orgId: string, projectId: string) =>
    mutationOptions({
      mutationKey: [...projectQueries.archiveKey(), orgId, projectId] as const,
      mutationFn: async () => await api.post(`v1/organizations/${orgId}/projects/${projectId}/archive`),
    }),
  unarchiveKey: () => [...projectQueries.all(), "unarchive"] as const,
  unarchive: (orgId: string, projectId: string) =>
    mutationOptions({
      mutationKey: [...projectQueries.unarchiveKey(), orgId, projectId] as const,
      mutationFn: async () => await api.post(`v1/organizations/${orgId}/projects/${projectId}/unarchive`),
    }),
  updateKey: () => [...projectQueries.all(), "update"] as const,
  update: (orgId: string, projectId: string) =>
    mutationOptions({
      mutationKey: [...projectQueries.updateKey(), orgId, projectId] as const,
      mutationFn: async (data: UpdateProjectInput) => await api.patch<Project>(`v1/organizations/${orgId}/projects/${projectId}`, data),
    }),
  deleteKey: () => [...projectQueries.all(), "delete"] as const,
  delete: (orgId: string, projectId: string) =>
    mutationOptions({
      mutationKey: [...projectQueries.deleteKey(), orgId, projectId] as const,
      mutationFn: async () => await api.delete(`v1/organizations/${orgId}/projects/${projectId}`),
    }),
}