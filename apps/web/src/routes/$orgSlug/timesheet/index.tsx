import { createFileRoute } from "@tanstack/react-router";
import { AppBody } from "@/components/layouts/app-body";
import { AppContent } from "@/components/layouts/app-content";
import { AppHeader } from "@/components/layouts/app-header";

export const Route = createFileRoute("/$orgSlug/timesheet/")({
  head: () => ({
    meta: [{ title: "Timesheet — Bee Time" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { orgSlug } = Route.useParams();

  return (
    <AppContent>
      <AppHeader breadcrumbs={[{ title: "Timesheet", to: "/$orgSlug/timesheet", params: { orgSlug } }]} />
      <AppBody>test</AppBody>
    </AppContent>
  );
}
