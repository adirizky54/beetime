import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$orgSlug/projects/$projectId/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/$orgSlug/projects/$projectId/tasks"!</div>;
}
