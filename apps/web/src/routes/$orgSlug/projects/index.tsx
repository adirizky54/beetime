import {
  RiAddLine,
  RiArchiveLine,
  RiCheckboxBlankCircleLine,
  RiGlobalLine,
  RiLock2Line,
  RiSearchLine,
} from "@remixicon/react";
import { useDebouncedCallback } from "@tanstack/react-pacer/debouncer";
import { Link, createFileRoute } from "@tanstack/react-router";
import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { ProjectQuerySchema, type Project } from "@beetime/schema";
import { Button } from "@beetime/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@beetime/ui/components/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@beetime/ui/components/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beetime/ui/components/tooltip";

import { Can } from "@/components/ui/can";
import { DataTable } from "@/components/ui/data-table";
import { AppBody } from "@/components/layouts/app-body";
import { AppContent } from "@/components/layouts/app-content";
import { AppHeader } from "@/components/layouts/app-header";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { ActionsProject } from "@/components/projects/actions-project";
import { MembersProject } from "@/components/projects/members-project";
import { projectQueries } from "@/queries/project";
import { formatDate } from "@/utils/time";
import { toTitleCase } from "@/utils/string";

export const Route = createFileRoute("/$orgSlug/projects/")({
  head: () => ({
    meta: [{ title: "Projects — Bee Time" }],
  }),
  validateSearch: ProjectQuerySchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();
  const { orgSlug } = Route.useParams();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const [searchText, setSearchText] = useState(search.search ?? "");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: projects, isLoading: loadingProjects } = useQuery(projectQueries.list(organization.id, search));

  const debouncedSetSearch = useDebouncedCallback(
    (_search: string) => {
      navigate({
        search: (prev) => ({
          ...prev,
          page: 1,
          search: _search,
        }),
      });
    },
    { wait: 500 },
  );

  const pagination = {
    pageIndex: search.page - 1,
    pageSize: search.pageSize,
  };

  const columns = useMemo<Array<ColumnDef<Project>>>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const project = row.original;
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Link
                  to="/$orgSlug/projects/$projectId"
                  params={{ orgSlug, projectId: project.id }}
                  className="truncate font-medium hover:underline"
                >
                  {project.name}
                </Link>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      project.privacy === "public" ? (
                        <RiGlobalLine className="size-4 text-muted-foreground" />
                      ) : (
                        <RiLock2Line className="size-4 text-muted-foreground" />
                      )
                    }
                  />
                  <TooltipContent>{toTitleCase(project.privacy)}</TooltipContent>
                </Tooltip>

                {project.archivedAt ? (
                  <Tooltip>
                    <TooltipTrigger render={<RiArchiveLine className="size-4 text-muted-foreground" />} />
                    <TooltipContent>Archived</TooltipContent>
                  </Tooltip>
                ) : null}

                <Can orgId={project.organizationId} permissions={{ project: ["update"] }}>
                  <ActionsProject project={project} />
                </Can>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "members",
        header: "Members",
        meta: {
          header: () => ({
            className: "text-right",
          }),
          cell: () => ({
            className: "text-right",
          }),
        },
        cell: ({ row }) => <MembersProject project={row.original} />,
      },
      {
        accessorKey: "createdAt",
        header: "Created at",
        cell: ({ row }) => formatDate(row.original.createdAt, organization.dateFormat),
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: projects?.data ?? [],
    pageCount: projects?.meta?.pageCount ?? 0,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: {
      pagination,
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === "function" ? updater(pagination) : updater;

      navigate({
        search: {
          ...search,
          page: newPagination.pageIndex + 1,
          pageSize: newPagination.pageSize,
        },
      });
    },
  });

  const onSearch = (_search: string) => {
    setSearchText(_search);
    debouncedSetSearch(_search);
  };

  return (
    <AppContent>
      <AppHeader breadcrumbs={[{ title: "Projects", to: "/$orgSlug/projects", params: { orgSlug } }]}>
        <Can orgId={organization.id} permissions={{ project: ["create"] }}>
          <Button className="ml-auto" size="sm" onClick={() => setCreateDialogOpen(true)}>
            <RiAddLine data-icon="inline-start" />
            Create Project
          </Button>
        </Can>
      </AppHeader>

      <AppBody>
        <div className="w-full">
          <div className="flex flex-wrap items-start gap-2.5">
            <InputGroup className="md:w-56">
              <InputGroupInput placeholder="Search..." value={searchText} onChange={(e) => onSearch(e.target.value)} />
              <InputGroupAddon align="inline-start">
                <RiSearchLine className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                <RiCheckboxBlankCircleLine data-icon="inline-start" />
                <span className="text-muted-foreground">Status:</span> {toTitleCase(search.status)}
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-32">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={search.status}
                    onValueChange={(value) => {
                      navigate({ search: { ...search, status: value } });
                    }}
                  >
                    <DropdownMenuRadioItem value="all" closeOnClick>
                      All
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="active" closeOnClick>
                      Active
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="archived" closeOnClick>
                      Archived
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <DataTable
          table={table}
          loading={loadingProjects}
          row={() => ({
            className: "group/table-row",
          })}
        />
      </AppBody>

      <Can orgId={organization.id} permissions={{ project: ["create"] }}>
        <CreateProjectDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} orgId={organization.id} />
      </Can>
    </AppContent>
  );
}
