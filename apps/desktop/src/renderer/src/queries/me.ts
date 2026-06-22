import { queryOptions } from "@tanstack/react-query";
import type { Organization, Session, User } from "@/lib/auth";
import { api } from "@/lib/api";

type MeResponse = {
  session: Session;
  user: User;
  organizations: Array<Organization>;
};

export const meQueries = {
  all: () => ["me"] as const,
  get: () =>
    queryOptions({
      queryKey: [...meQueries.all()] as const,
      queryFn: async ({ signal }) => await api.get<MeResponse>("v1/me", { signal }),
      staleTime: 0,
    }),
};
