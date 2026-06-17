import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$orgSlug/")({
  head: () => ({
    meta: [{ title: "Dashboard — Bee Time" }],
  }),
  loader: ({ params }) => {
    throw redirect({
      to: "/$orgSlug/dashboard",
      params,
    });
  },
});
