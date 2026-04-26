import { createFileRoute } from "@tanstack/react-router"
import { AppBody } from "@/components/layouts/app-body"
import { AppContent } from "@/components/layouts/app-content"
import { AppHeader } from "@/components/layouts/app-header"

export const Route = createFileRoute("/$orgId/members/")({
  head: () => ({
    meta: [{ title: "Members — Bee Time" }]
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { orgId } = Route.useParams();

  return (
    <AppContent>
      <AppHeader
        breadcrumbs={[
          { title: "Members", to: "/$orgId/members", params: { orgId } },
        ]}
      />
      <AppBody>
        test
      </AppBody>
    </AppContent>
  )
}
