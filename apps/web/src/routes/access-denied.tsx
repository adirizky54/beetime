import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { RiShieldLine } from "@remixicon/react";

import { Button } from "@beetime/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@beetime/ui/components/empty";

import { MinimalLayout } from "@/components/layouts/minimal-layout";

export const Route = createFileRoute("/access-denied")({
  head: () => ({
    meta: [{ title: "Access Denied — Bee Time" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  return (
    <MinimalLayout>
      <div className="w-full max-w-md">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RiShieldLine />
            </EmptyMedia>
            <EmptyTitle>Access Denied</EmptyTitle>
            <EmptyDescription>
              You don't have permission to view this page. Contact your organization owner or admin to request access.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Button size="sm" variant="outline" onClick={() => router.history.back()}>
              Go Back
            </Button>
            <Button size="sm" render={<Link to="/" />} nativeButton={false}>
              Go Home
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </MinimalLayout>
  );
}
