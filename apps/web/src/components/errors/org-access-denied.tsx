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

export function OrgAccessDenied() {
  return (
    <section className="relative m-auto flex h-screen w-full items-center justify-center bg-background p-16 text-foreground">
      <div className="relative flex w-full justify-center">
        <div className="relative flex min-h-svh w-full flex-col justify-center bg-background p-6 md:p-10">
          <div className="relative mx-auto w-full max-w-5xl">
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
        </div>
      </div>
    </section>
  );
}
