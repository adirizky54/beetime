import { createFileRoute } from "@tanstack/react-router"
import { AppBody } from "@/components/layouts/app-body"
import { AppContent } from "@/components/layouts/app-content"
import { AppHeader } from "@/components/layouts/app-header"

export const Route = createFileRoute("/$orgId/projects/$projectId/")({
  head: () => ({
    meta: [{ title: "Sampe Project — Bee Time" }]
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { orgId, projectId } = Route.useParams();

  return (
    <AppContent>
      <AppHeader
        breadcrumbs={[
          { title: "Projects", to: "/$orgId/projects", params: { orgId } },
          { title: "Sample Project", to: "/$orgId/projects/$projectId", params: { orgId, projectId } },
        ]}
      />
      <AppBody>
        test
      </AppBody>
    </AppContent>
  )
}
