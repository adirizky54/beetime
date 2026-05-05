import { Link } from "@tanstack/react-router";
import { RiFolder6Line } from "@remixicon/react";

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

export function OrgAccessDenied() {
  return (
    <MinimalLayout>
      <div className="w-full max-w-md">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RiFolder6Line />
            </EmptyMedia>
            <EmptyTitle>Organization not found</EmptyTitle>
            <EmptyDescription>
              The organization you are trying to access does not exist or you do not have permission to view it.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Button size="sm" render={<Link to="/" />} nativeButton={false}>
              Go Home
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </MinimalLayout>
  );
}
