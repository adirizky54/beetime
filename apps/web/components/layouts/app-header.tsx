import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@beetime/ui/components/breadcrumb";
import { Separator } from "@beetime/ui/components/separator";
import { SidebarTrigger } from "@beetime/ui/components/sidebar";
import { cn } from "@beetime/ui/lib/utils";

import { Link, type RegisteredRouter, type ValidateLinkOptionsArray } from "@tanstack/react-router";

interface AppHeaderProps<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TItems extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
> extends React.ComponentProps<"header"> {
  breadcrumbs: ValidateLinkOptionsArray<TRouter, TItems>;
}

export function AppHeader<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TItems extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
>(props: AppHeaderProps<TRouter, TItems>): React.ReactNode;
export function AppHeader({ className, breadcrumbs, children, ...props }: AppHeaderProps): React.ReactNode {
  return (
    <header className={cn("flex h-16 shrink-0 items-center gap-2", className)} {...props}>
      <div className="flex flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />

        <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-center" />

        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              if (!isLast) {
                return (
                  <Fragment key={index}>
                    <BreadcrumbItem>
                      <BreadcrumbLink render={<Link {...breadcrumb} />}>{breadcrumb.title}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </Fragment>
                );
              }

              return (
                <BreadcrumbItem key={index}>
                  <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {children}
      </div>
    </header>
  );
}
