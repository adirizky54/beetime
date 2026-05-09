import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
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
  const { session } = Route.useRouteContext();

  useMount(async () => {
    if (session && session.activeOrganizationId) {
      const org = await auth.organization.getFullOrganization({
        query: {
          organizationId: session.activeOrganizationId,
        },
      });

      if (!org.error) {
        void navigate({
          to: "/$orgSlug",
          params: {
            orgSlug: org.data.slug,
          },
        });
      }
    } else {
      const { data: organizations } = await auth.organization.list();

      if (Array.isArray(organizations) && organizations.length > 0) {
        navigate({
          to: "/$orgSlug",
          params: {
            orgSlug: organizations[0].slug,
          },
        });
      } else {
        navigate({ to: "/create-organization" });
      }
    }
  });

  return null;
}
