import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppBody } from "@/components/layouts/app-body";
import { AppContent } from "@/components/layouts/app-content";
import { AppHeader } from "@/components/layouts/app-header";
import { authQueries } from "@/queries/auth";

export const Route = createFileRoute("/$orgSlug/projects/$projectId/")({
  beforeLoad: async ({ context }) => {
    const result = await context.queryClient.ensureQueryData(
      authQueries.hasPermission(context.organization.id, { project: ["read"] }),
    );

    if (!result.data?.success) {
      throw redirect({ to: "/access-denied" });
    }
  },
  head: () => ({
    meta: [{ title: "Sampe Project — Bee Time" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { orgSlug, projectId } = Route.useParams();

  return (
    <AppContent>
      <AppHeader
        breadcrumbs={[
          { title: "Projects", to: "/$orgSlug/projects", params: { orgSlug } },
          { title: "Sample Project", to: "/$orgSlug/projects/$projectId", params: { orgSlug, projectId } },
        ]}
      />
      <AppBody>test</AppBody>
    </AppContent>
  );
}
