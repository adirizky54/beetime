import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { QueryClient } from "@tanstack/react-query";

import appCss from "@beetime/ui/globals.css?url";
import { TooltipProvider } from "@beetime/ui/components/tooltip";
import { AnchoredToastProvider, ToastProvider } from "@beetime/ui/components/toast";

import { NotFound } from "@/components/errors/not-found";
import { auth, type Organization, type Session, type User } from "@/lib/auth";

type RouterContext = {
  queryClient: QueryClient;
  session: Session | null;
  user: User | null;
  organization: Organization | null;
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
  beforeLoad: async () => {
    const session = await auth.getSession();
    return {
      session: session.data?.session ?? null,
      user: session.data?.user ?? null,
    };
  },
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  ssr: false,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ToastProvider>
          <AnchoredToastProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </AnchoredToastProvider>
        </ToastProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
