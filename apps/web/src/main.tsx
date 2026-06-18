import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Organization, Session, User } from "./lib/auth";
import { routeTree } from "./routeTree.gen";

type RouterContext = {
  queryClient: QueryClient;
  session: Session | null;
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
};

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

const router = createRouter({
  routeTree,
  context: {
    queryClient,
    session: null,
    user: null,
    organization: null,
    organizations: [],
  } satisfies RouterContext,
  scrollRestoration: true,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}
