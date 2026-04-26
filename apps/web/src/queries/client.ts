import { keepPreviousData, mutationOptions, queryOptions } from "@tanstack/react-query";
import type { Client, ClientAllQuery, ClientQuery, CreateClientInput, UpdateClientInput } from "@beetime/schema";

import { api } from "@/lib/api";

export const clientQueries = {
  all: () => ["clients"] as const,
  listKey: () => [...clientQueries.all(), "list"] as const,
  list: (orgId: string, searchParams: ClientQuery) =>
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
  listAll: (orgId: string, searchParams: ClientAllQuery) =>
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
      mutationFn: async (data: CreateClientInput) => await api.post<Client>(`v1/organizations/${orgId}/clients`, data),
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
      mutationFn: async (data: UpdateClientInput) => await api.patch(`v1/organizations/${orgId}/clients/${clientId}`, data),
    }),
  deleteKey: () => [...clientQueries.all(), "delete"] as const,
  delete: (orgId: string, clientId: string) =>
    mutationOptions({
      mutationKey: [...clientQueries.deleteKey(), orgId, clientId] as const,
      mutationFn: async () => await api.delete(`v1/organizations/${orgId}/clients/${clientId}`),
    }),
};
