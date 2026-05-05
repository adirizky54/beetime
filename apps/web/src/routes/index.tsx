import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }

    if (context.session.activeOrganizationId) {
      const org = await auth.organization.getFullOrganization({
        query: {
          organizationId: context.session.activeOrganizationId,
        },
      });

      if (org.data) {
        throw redirect({
          to: "/$orgSlug",
          params: {
            orgSlug: org.data.slug,
          },
        });
      }
    } else {
      const { data: organizations } = await auth.organization.list();

      if (Array.isArray(organizations) && organizations.length > 0) {
        throw redirect({
          to: "/$orgSlug",
          params: {
            orgSlug: organizations[0].slug,
          },
        });
      } else {
        throw redirect({ to: "/create-organization" });
      }
    }
  },
});
