import { RiAddLine, RiArchiveLine, RiCheckboxBlankCircleLine, RiSearchLine } from "@remixicon/react";
import { useDebouncedCallback } from "@tanstack/react-pacer/debouncer";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { ClientQuerySchema, type Client } from "@beetime/schema";
import { Button } from "@beetime/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@beetime/ui/components/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@beetime/ui/components/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beetime/ui/components/tooltip";

import { Can } from "@/components/ui/can";
import { DataTable } from "@/components/ui/data-table";
import { AppBody } from "@/components/layouts/app-body";
import { AppContent } from "@/components/layouts/app-content";
import { AppHeader } from "@/components/layouts/app-header";
import { CreateClientDialog } from "@/components/clients/create-client-dialog";
import { ActionsClient } from "@/components/clients/actions-client";
import { clientQueries } from "@/queries/client";
import { toTitleCase } from "@/utils/string";

export const Route = createFileRoute("/$orgId/clients/")({
  head: () => ({
    meta: [{ title: "Clients — Bee Time" }]
  }),
  validateSearch: ClientQuerySchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { orgId } = Route.useParams();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const [searchText, setSearchText] = useState(search.search ?? "");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: clients, isLoading: loadingClients } = useQuery(clientQueries.list(
    orgId,
    search
  ));

  const debouncedSetSearch = useDebouncedCallback((_search: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        search: _search,
      }),
    });
  }, { wait: 500 });

  const pagination = {
    pageIndex: search.page - 1,
    pageSize: search.pageSize,
  };

  const columns = useMemo<Array<ColumnDef<Client>>>(() => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{client.name}</span>

            {client.archivedAt ? (
              <Tooltip>
                <TooltipTrigger render={<RiArchiveLine className="size-4 text-muted-foreground" />} />
                <TooltipContent>Archived</TooltipContent>
              </Tooltip>
            ) : null}

            <Can orgId={client.organizationId} permissions={{ client: ["update"] }}>
              <ActionsClient client={client} />
            </Can>
          </div>
        );
      }
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone ?? <span className="text-muted-foreground">—</span>,
    },
  ], []);

  const table = useReactTable({
    columns,
    data: clients?.data ?? [],
    pageCount: clients?.meta?.pageCount ?? 0,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: {
      pagination
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
      <AppHeader
        breadcrumbs={[
          { title: "Clients", to: "/$orgId/clients", params: { orgId } },
        ]}
      >
        <Can orgId={orgId} permissions={{ client: ["create"] }}>
          <Button className="ml-auto" size="sm" onClick={() => setCreateDialogOpen(true)}>
            <RiAddLine data-icon="inline-start" />
            Create Client
          </Button>
        </Can>
      </AppHeader>

      <AppBody>
        <div className="w-full">
          <div className="flex items-start flex-wrap gap-2.5">
            <InputGroup className="md:w-56">
              <InputGroupInput
                placeholder="Search..."
                value={searchText}
                onChange={(e) => onSearch(e.target.value)}
              />
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
                    <DropdownMenuRadioItem value="all" closeOnClick>All</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="active" closeOnClick>Active</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="archived" closeOnClick>Archived</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <DataTable
          table={table}
          loading={loadingClients}
          row={() => ({
            className: "group/table-row"
          })}
        />
      </AppBody>

      <Can orgId={orgId} permissions={{ client: ["create"] }}>
        <CreateClientDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          orgId={orgId}
        />
      </Can>
    </AppContent>
  );
}
