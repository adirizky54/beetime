import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

import { Toaster } from "@beetime/ui/components/sonner";
import { TooltipProvider } from "@beetime/ui/components/tooltip";

import type { Session, User } from "@/lib/auth";
import { meQueries } from "@/queries/me";

import "../globals.css";

type RouterContext = {
  queryClient: QueryClient;
  session: Session | null;
  user: User | null;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const result = await context.queryClient.fetchQuery(meQueries.get());

    return {
      session: result.data?.session ?? null,
      user: result.data?.user ?? null,
    };
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <TooltipProvider>
      <Outlet />
      <Toaster />
    </TooltipProvider>
  );
}
