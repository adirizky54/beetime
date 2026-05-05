import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import type { Session, User } from "./lib/auth";
import { routeTree } from "./routeTree.gen";

type RouterContext = {
  queryClient: QueryClient;
  session: Session | null;
  user: User | null;
};

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 5 * 60_000, // 5 minutes
      },
      mutations: {
        retry: false,
      },
    },
  });

  const router = createTanStackRouter({
    routeTree,
    context: {
      queryClient,
      session: null,
      user: null,
    } satisfies RouterContext,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
