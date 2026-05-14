import { createFileRoute, redirect } from "@tanstack/react-router";

import { useMount } from "@/hooks/use-mount";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { organizations } = Route.useRouteContext();

  useMount(async () => {
    if (organizations.length > 0) {
      navigate({
        to: "/$orgSlug",
        params: {
          orgSlug: organizations[0].slug,
        },
      });
    } else {
      navigate({ to: "/create-organization" });
    }
  });

  return null;
}
