import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$orgId/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/$orgId/settings/"!</div>;
}
