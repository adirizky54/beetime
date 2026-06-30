import { useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, redirect, Link, Outlet } from "@tanstack/react-router";
import {
  RiArchiveLine,
  RiDashboardFill,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiFolder3Fill,
  RiGlobalLine,
  RiGroupFill,
  RiHistoryLine,
  RiLock2Line,
  RiMoreFill,
  RiTrelloFill,
} from "@remixicon/react";
import { HTTPError } from "ky";

import { Avatar, AvatarFallback } from "@beetime/ui/components/avatar";
import { Button } from "@beetime/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beetime/ui/components/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@beetime/ui/components/empty";
import { Separator } from "@beetime/ui/components/separator";
import { Tabs, TabsList, TabsTrigger } from "@beetime/ui/components/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beetime/ui/components/tooltip";
import { toast } from "@beetime/ui/components/sonner";

import { AppBody } from "@/components/layouts/app-body";
import { AppContent } from "@/components/layouts/app-content";
import { AppHeader } from "@/components/layouts/app-header";
import { Can } from "@/components/ui/can";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { authQueries } from "@/queries/auth";
import { projectQueries } from "@/queries/project";
import { toTitleCase } from "@/utils/string";

export const Route = createFileRoute("/$orgSlug/projects/$projectId")({
  beforeLoad: async ({ context }) => {
    const result = await context.queryClient.ensureQueryData(
      authQueries.hasPermission(context.organization.id, { project: ["read"] }),
    );

    if (!result.data?.success) {
      throw redirect({ to: "/access-denied" });
    }
  },
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(
        projectQueries.detail(context.organization.id, params.projectId),
      );
    } catch (error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        throw notFound();
      }
      throw error;
    }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.data?.name ?? "Detail Project"} — Bee Time` }],
  }),
  component: RouteComponent,
  notFoundComponent: NotFoundComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { organization } = Route.useRouteContext();
  const { orgSlug, projectId } = Route.useParams();

  const { data: project } = useSuspenseQuery(projectQueries.detail(organization.id, projectId));

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { mutate: archiveProject } = useMutation({
    ...projectQueries.archive(organization.id, projectId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: projectQueries.detailkey() });
      toast.success(response.message);
    },
    onError: () => {
      toast.error("Failed to archive project");
    },
  });

  const { mutate: unarchiveProject } = useMutation({
    ...projectQueries.unarchive(organization.id, projectId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: projectQueries.detailkey() });
      toast.success(response.message);
    },
    onError: () => {
      toast.error("Failed to unarchive project");
    },
  });

  const projectName = project.data?.name ?? "Untitled Project";
  const projectPrivacy = project.data?.privacy ?? "public";
  const isArchived = !!project.data?.archivedAt;

  return (
    <AppContent>
      <AppHeader
        breadcrumbs={[
          { title: "Projects", to: "/$orgSlug/projects", params: { orgSlug } },
          { title: projectName, to: "/$orgSlug/projects/$projectId", params: { orgSlug, projectId } },
        ]}
      />

      <AppBody className="gap-0 px-0">
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-start gap-3">
            <Avatar className="rounded after:rounded">
              <AvatarFallback className="rounded">
                <RiFolder3Fill className="size-4.5" />
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-start gap-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{projectName}</h1>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      projectPrivacy === "public" ? (
                        <RiGlobalLine className="size-4.5 text-muted-foreground" />
                      ) : (
                        <RiLock2Line className="size-4.5 text-muted-foreground" />
                      )
                    }
                  />
                  <TooltipContent>{toTitleCase(projectPrivacy)}</TooltipContent>
                </Tooltip>

                {isArchived ? (
                  <Tooltip>
                    <TooltipTrigger render={<RiArchiveLine className="size-4.5 text-muted-foreground" />} />
                    <TooltipContent>Archived</TooltipContent>
                  </Tooltip>
                ) : null}

                <Tooltip>
                  <DropdownMenu>
                    <TooltipTrigger
                      render={
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-xs">
                              <RiMoreFill className="size-4.5" />
                            </Button>
                          }
                        />
                      }
                    />
                    <TooltipContent>Project Actions</TooltipContent>
                    <DropdownMenuContent className="min-w-40">
                      <DropdownMenuItem closeOnClick>
                        <RiFileCopyLine />
                        Copy Project...
                      </DropdownMenuItem>

                      <Can orgId={organization.id} permissions={{ project: ["archive"] }}>
                        <DropdownMenuItem
                          onClick={() => {
                            if (isArchived) {
                              unarchiveProject();
                            } else {
                              archiveProject();
                            }
                          }}
                          closeOnClick
                        >
                          {isArchived ? <RiHistoryLine /> : <RiArchiveLine />}
                          {isArchived ? "Unarchive" : "Archive"}
                        </DropdownMenuItem>
                      </Can>

                      <Can orgId={organization.id} permissions={{ project: ["delete"] }}>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setShowDeleteDialog(true)} closeOnClick>
                          <RiDeleteBinLine />
                          Delete
                        </DropdownMenuItem>
                      </Can>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Tooltip>
              </div>

              {project.data?.client ? (
                <p className="text-sm font-medium">{project.data.client.name}</p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">No client</p>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue={null} className="gap-0">
          <TabsList variant="line" className="mx-4 px-0">
            <TabsTrigger
              nativeButton={false}
              render={
                <Link to="/$orgSlug/projects/$projectId/overview" params={{ orgSlug, projectId }} preload={false} />
              }
              value="overview"
            >
              <RiDashboardFill />
              Overview
            </TabsTrigger>
            <TabsTrigger
              nativeButton={false}
              render={<Link to="/$orgSlug/projects/$projectId/tasks" params={{ orgSlug, projectId }} preload={false} />}
              value="tasks"
            >
              <RiTrelloFill />
              Tasks
            </TabsTrigger>
            <TabsTrigger
              nativeButton={false}
              render={
                <Link to="/$orgSlug/projects/$projectId/members" params={{ orgSlug, projectId }} preload={false} />
              }
              value="members"
            >
              <RiGroupFill />
              Members
            </TabsTrigger>
          </TabsList>

          <Separator />

          <Outlet />
        </Tabs>
      </AppBody>

      {project.data ? (
        <Can orgId={organization.id} permissions={{ project: ["delete"] }}>
          <DeleteProjectDialog project={project.data} open={showDeleteDialog} onOpenChange={setShowDeleteDialog} />
        </Can>
      ) : null}
    </AppContent>
  );
}

function NotFoundComponent() {
  const { orgSlug } = Route.useParams();

  return (
    <AppContent>
      <AppBody>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RiFolder3Fill />
            </EmptyMedia>
            <EmptyTitle>Project not found</EmptyTitle>
            <EmptyDescription>The project you are trying to access does not exist.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              size="sm"
              render={<Link to="/$orgSlug/projects" params={{ orgSlug }} preload={false} />}
              nativeButton={false}
            >
              Go to projects
            </Button>
          </EmptyContent>
        </Empty>
      </AppBody>
    </AppContent>
  );
}
