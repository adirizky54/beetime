import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { projectQueries } from "@/queries/project";

export const Route = createFileRoute("/$orgSlug/projects/$projectId/overview")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { organization } = Route.useRouteContext();
  const { orgSlug, projectId } = Route.useParams();

  const { data: project } = useSuspenseQuery(projectQueries.detail(organization.id, projectId));

  return (
    <div className="relative p-4">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-4"></div>
    </div>
  );
}
