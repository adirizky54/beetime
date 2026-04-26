import { keepPreviousData, mutationOptions, queryOptions } from "@tanstack/react-query";
import * as v from "valibot";

import { api } from "@/lib/api";

export const ClientSchema = v.object({
  id: v.string(),
  name: v.string(),
  email: v.nullable(v.string()),
  phone: v.nullable(v.string()),
  address: v.nullable(v.string()),
  organizationId: v.string(),
  createdBy: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  archivedAt: v.nullable(v.string()),
});

export type Client = v.InferOutput<typeof ClientSchema>;

export const ClientSearchParamsSchema = v.object({
  search: v.optional(v.string()),
  status: v.optional(v.picklist(["all", "active", "archived"]), "all"),
  page: v.optional(v.number(), 1),
  pageSize: v.optional(v.number(), 10),
});

export type ClientSearchParams = v.InferOutput<typeof ClientSearchParamsSchema>;

export const ClientCreateSchema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Name must not be empty"),
  ),
  email: v.nullish(
    v.pipe(
      v.string(),
      v.email("Please enter a valid email address"),
    ),
  ),
  phone: v.nullish(v.string()),
  address: v.nullish(v.string()),
});

export type ClientCreateInput = v.InferInput<typeof ClientCreateSchema>;

export const clientQueries = {
  all: () => ["clients"] as const,
  listKey: () => [...clientQueries.all(), "list"] as const,
  list: (orgId: string, searchParams: ClientSearchParams) =>
    queryOptions({
      queryKey: [...clientQueries.listKey(), orgId, searchParams] as const,
      queryFn: async ({ signal }) =>
        await api.get<Array<Client>>(`v1/organizations/${orgId}/clients`, {
          searchParams,
          signal,
        }),
      placeholderData: keepPreviousData,
    }),
  listAllKey: () => [...clientQueries.all(), "list-all"] as const,
  listAll: (orgId: string, searchParams: Pick<ClientSearchParams, "status">) =>
    queryOptions({
      queryKey: [...clientQueries.listAllKey(), orgId, searchParams] as const,
      queryFn: async ({ signal }) =>
        await api.get<Array<Client>>(`v1/organizations/${orgId}/clients/all`, {
          searchParams,
          signal,
        }),
    }),
  createKey: () => [...clientQueries.all(), "create"] as const,
  create: (orgId: string) =>
    mutationOptions({
      mutationKey: [...clientQueries.createKey(), orgId] as const,
      mutationFn: async (data: ClientCreateInput) => await api.post<Client>(`v1/organizations/${orgId}/clients`, data),
    }),
  archiveKey: () => [...clientQueries.all(), "archive"] as const,
  archive: (orgId: string, clientId: string) =>
    mutationOptions({
      mutationKey: [...clientQueries.archiveKey(), orgId, clientId] as const,
      mutationFn: async () => await api.post(`v1/organizations/${orgId}/clients/${clientId}/archive`),
    }),
  unarchiveKey: () => [...clientQueries.all(), "unarchive"] as const,
  unarchive: (orgId: string, clientId: string) =>
    mutationOptions({
      mutationKey: [...clientQueries.unarchiveKey(), orgId, clientId] as const,
      mutationFn: async () => await api.post(`v1/organizations/${orgId}/clients/${clientId}/unarchive`),
    }),
  updateKey: () => [...clientQueries.all(), "update"] as const,
  update: (orgId: string, clientId: string) =>
    mutationOptions({
      mutationKey: [...clientQueries.updateKey(), orgId, clientId] as const,
      mutationFn: async (data: ClientCreateInput) => await api.patch<Client>(`v1/organizations/${orgId}/clients/${clientId}`, data),
    }),
  deleteKey: () => [...clientQueries.all(), "delete"] as const,
  delete: (orgId: string, clientId: string) =>
    mutationOptions({
      mutationKey: [...clientQueries.deleteKey(), orgId, clientId] as const,
      mutationFn: async () => await api.delete(`v1/organizations/${orgId}/clients/${clientId}`),
    }),
};
