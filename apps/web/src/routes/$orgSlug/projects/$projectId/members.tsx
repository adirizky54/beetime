import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$orgSlug/projects/$projectId/members")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/$orgSlug/projects/$projectId/members"!</div>;
}
