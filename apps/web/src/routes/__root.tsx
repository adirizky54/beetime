import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { QueryClient } from "@tanstack/react-query";

import { Toaster } from "@beetime/ui/components/sonner";
import { TooltipProvider } from "@beetime/ui/components/tooltip";
import appCss from "@beetime/ui/globals.css?url";

import { NotFound } from "@/components/errors/not-found";
import type { Organization, Session, User } from "@/lib/auth";
import { meQueries } from "@/queries/me";

type RouterContext = {
  queryClient: QueryClient;
  session: Session | null;
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
};

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Bee Time" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const result = await context.queryClient.fetchQuery(meQueries.get());

    return {
      session: result.data?.session ?? null,
      user: result.data?.user ?? null,
      organizations: result.data?.organizations ?? [],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  ssr: false,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <TooltipProvider>
      <Outlet />
      <Toaster />
    </TooltipProvider>
  );
}
