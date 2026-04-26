import { createFileRoute, redirect } from "@tanstack/react-router"
import { auth } from "@/lib/auth"

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await auth.getSession();

    if (!session.data) {
      throw redirect({ to: "/login" });
    }

    if (session.data.session.activeOrganizationId) {
      throw redirect({
        to: "/$orgId",
        params: {
          orgId: session.data.session.activeOrganizationId
        }
      });
    } else {
      const { data: organizations } = await auth.organization.list();

      if (Array.isArray(organizations) && organizations.length > 0) {
        throw redirect({
          to: "/$orgId",
          params: {
            orgId: organizations[0].id
          }
        });
      }
    }
  },
});
