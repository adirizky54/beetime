import { keepPreviousData, mutationOptions, queryOptions } from "@tanstack/react-query";
import * as v from "valibot";

import { api } from "@/lib/api";

const ProjectMembersSchema = v.object({
  id: v.string(),
  name: v.string(),
  image: v.nullable(v.string()),
});

type ProjectMembers = v.InferOutput<typeof ProjectMembersSchema>;

export const ProjectSchema = v.object({
  id: v.string(),
  name: v.string(),
  description: v.nullable(v.string()),
  organizationId: v.string(),
  clientId: v.nullable(v.string()),
  client: v.nullable(v.object({
    id: v.string(),
    name: v.string(),
  })),
  privacy: v.picklist(["private", "public"]),
  members: v.array(ProjectMembersSchema),
  createdBy: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  archivedAt: v.nullable(v.string()),
});

export type Project = v.InferOutput<typeof ProjectSchema>;

export const ProjectSearchParamsSchema = v.object({
  search: v.optional(v.string()),
  status: v.optional(v.picklist(["all", "active", "archived"]), "all"),
  clientId: v.optional(v.string()),
  page: v.optional(v.number(), 1),
  pageSize: v.optional(v.number(), 10),
});

export type ProjectSearchParams = v.InferOutput<typeof ProjectSearchParamsSchema>;

export const ProjectCreateSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty("Name must not be empty"),
    ),
    description: v.nullish(v.string()),
    clientId: v.nullable(v.string()),
    privacy: v.optional(v.picklist(["private", "public"]), "public"),
    userIds: v.array(v.string()),
  }),
  v.forward(
    v.check(
      (input) => input.privacy !== "private" || input.userIds.length >= 1,
      "Please select at least one member",
    ),
    ["userIds"],
  ),
);

export type ProjectCreateInput = v.InferInput<typeof ProjectCreateSchema>;

export const projectQueries = {
  all: () => ["projects"] as const,
  listKey: () => [...projectQueries.all(), "list"] as const,
  list: (orgId: string, searchParams: ProjectSearchParams) => 
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
      queryFn: async ({ signal }) => await api.get<Array<ProjectMembers>>(`v1/organizations/${orgId}/projects/${projectId}/members`, {
        signal
      }),
    }),
  createKey: () => [...projectQueries.all(), "create"] as const,
  create: (orgId: string) => 
    mutationOptions({
      mutationKey: [...projectQueries.createKey(), orgId] as const,
      mutationFn: async (data: ProjectCreateInput) => await api.post<Project>(`v1/organizations/${orgId}/projects`, data),
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
      mutationFn: async (data: ProjectCreateInput) => await api.patch<Project>(`v1/organizations/${orgId}/projects/${projectId}`, data),
    }),
  deleteKey: () => [...projectQueries.all(), "delete"] as const,
  delete: (orgId: string, projectId: string) =>
    mutationOptions({
      mutationKey: [...projectQueries.deleteKey(), orgId, projectId] as const,
      mutationFn: async () => await api.delete(`v1/organizations/${orgId}/projects/${projectId}`),
    }),
}