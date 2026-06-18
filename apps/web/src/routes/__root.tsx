import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { QueryClient } from "@tanstack/react-query";

import { Toaster } from "@beetime/ui/components/sonner";
import { TooltipProvider } from "@beetime/ui/components/tooltip";

import { NotFound } from "@/components/errors/not-found";
import type { Organization, Session, User } from "@/lib/auth";
import { meQueries } from "@/queries/me";

import "../globals.css";

type RouterContext = {
  queryClient: QueryClient;
  session: Session | null;
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
};

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [{ title: "Bee Time" }],
    links: [{ rel: "icon", href: "/favicon.ico" }],
  }),
  beforeLoad: async ({ context }) => {
    const result = await context.queryClient.fetchQuery(meQueries.get());

    return {
      session: result.data?.session ?? null,
      user: result.data?.user ?? null,
      organizations: result.data?.organizations ?? [],
    };
  },
  component: RootComponent,
  notFoundComponent: NotFound,
  ssr: false,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <TooltipProvider>
        <Outlet />
        <Toaster />
      </TooltipProvider>
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </>
  );
}
