import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }

    if (context.session.activeOrganizationId) {
      throw redirect({
        to: "/$orgId",
        params: {
          orgId: context.session.activeOrganizationId,
        },
      });
    } else {
      const { data: organizations } = await auth.organization.list();

      if (Array.isArray(organizations) && organizations.length > 0) {
        throw redirect({
          to: "/$orgId",
          params: {
            orgId: organizations[0].id,
          },
        });
      } else {
        throw redirect({ to: "/create-organization" });
      }
    }
  },
});
