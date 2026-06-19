import { createRoot } from "react-dom/client";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

type RouterContext = {
  queryClient: QueryClient;
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
  } satisfies RouterContext,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultPendingMinMs: 0,
  history: createMemoryHistory({
    initialEntries: ["/"],
  }),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
