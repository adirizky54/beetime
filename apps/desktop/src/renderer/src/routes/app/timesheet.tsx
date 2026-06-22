import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/timesheet")({
  component: RouteComponent,
  pendingComponent: () => <div>Pending</div>,
});

function RouteComponent() {
  return <div>In development</div>;
}
