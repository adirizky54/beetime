import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$orgSlug/projects/$projectId/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/$orgSlug/projects/$projectId/overview",
      params,
    });
  },
});
