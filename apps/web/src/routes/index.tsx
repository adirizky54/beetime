import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }

    const organizations = context.organizations;

    if (organizations.length > 0) {
      throw redirect({
        to: "/$orgSlug",
        params: {
          orgSlug: organizations[0].slug,
        },
      });
    } else {
      throw redirect({ to: "/create-organization" });
    }
  },
});
