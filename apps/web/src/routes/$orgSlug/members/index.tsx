import { RiAddLine, RiLock2Line, RiSearchLine, RiShieldUserLine } from "@remixicon/react";
import { useDebouncedCallback } from "@tanstack/react-pacer/debouncer";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import * as v from "valibot";

import { MemberQuerySchema, type Member } from "@beetime/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@beetime/ui/components/avatar";
import { Badge } from "@beetime/ui/components/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beetime/ui/components/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beetime/ui/components/tooltip";

import { Can } from "@/components/ui/can";
import { DataTable } from "@/components/ui/data-table";
import { AppBody } from "@/components/layouts/app-body";
import { AppContent } from "@/components/layouts/app-content";
import { AppHeader } from "@/components/layouts/app-header";
import { ActionsMember } from "@/components/members/actions-member";
import { ActionsInvitation } from "@/components/members/actions-invitation";
import { InviteMemberDialog } from "@/components/members/invite-member-dialog";
import type { Invitation } from "@/lib/auth";
import { authQueries } from "@/queries/auth";
import { memberQueries } from "@/queries/member";
import { invitationQueries } from "@/queries/invitation";
import { formatDateTime } from "@/utils/time";
import { getInitials, toTitleCase } from "@/utils/string";
import { usePermission } from "@/hooks/use-permission";

const MembersPageSearchSchema = v.object({
  ...MemberQuerySchema.entries,
  tab: v.optional(v.picklist(["members", "invitations"]), "members"),
});

export const Route = createFileRoute("/$orgSlug/members/")({
  beforeLoad: async ({ context }) => {
    const result = await context.queryClient.ensureQueryData(
      authQueries.hasPermission(context.organization.id, { member: ["read"] }),
    );

    if (!result.data?.success) {
      throw redirect({ to: "/access-denied" });
    }
  },
  head: () => ({
    meta: [{ title: "Members — Bee Time" }],
  }),
  validateSearch: MembersPageSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { organization, user } = Route.useRouteContext();
  const { orgSlug } = Route.useParams();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const { data: canUpdate } = usePermission(organization.id, { member: ["update"] });
  const { data: canDelete } = usePermission(organization.id, { member: ["delete"] });

  const [searchText, setSearchText] = useState(search.search ?? "");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: members, isLoading: loadingMembers } = useQuery({
    ...memberQueries.list(organization.id, search),
    enabled: search.tab === "members",
  });
  const { data: invitations, isLoading: loadingInvitations } = useQuery({
    ...invitationQueries.list(organization.id),
    enabled: search.tab === "invitations",
  });

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

  const memberColumns = useMemo<Array<ColumnDef<Member>>>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarImage src={member.image ?? undefined} alt={member.name} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>

              <span className="truncate font-medium">{member.name}</span>

              {member.banned ? (
                <Tooltip>
                  <TooltipTrigger render={<RiLock2Line className="size-4 text-destructive" />} />
                  <TooltipContent>Banned</TooltipContent>
                </Tooltip>
              ) : null}

              {member.userId !== user?.id ? (
                <ActionsMember
                  canUpdate={Boolean(canUpdate)}
                  canDelete={Boolean(canDelete)}
                  member={member}
                  orgId={organization.id}
                />
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => toTitleCase(row.original.role),
      },
      {
        accessorKey: "createdAt",
        header: "Joined at",
        cell: ({ row }) => formatDateTime(row.original.createdAt, organization.dateFormat, organization.timeFormat),
      },
    ],
    [canUpdate, canDelete, organization.id, user?.id],
  );

  const invitationColumns = useMemo<Array<ColumnDef<Invitation>>>(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
          const inv = row.original;
          return (
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">{inv.email}</span>
              <ActionsInvitation invitation={inv} orgId={organization.id} />
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => toTitleCase(row.original.role),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const variant = {
            pending: "warning",
            accepted: "success",
            rejected: "error",
            canceled: "secondary",
          } as const;

          return <Badge variant={variant[status]}>{toTitleCase(status)}</Badge>;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Invited at",
        cell: ({ row }) => formatDateTime(row.original.createdAt, organization.dateFormat, organization.timeFormat),
      },
      {
        accessorKey: "expiresAt",
        header: "Expires at",
        cell: ({ row }) => formatDateTime(row.original.expiresAt, organization.dateFormat, organization.timeFormat),
      },
    ],
    [organization.id],
  );

  const membersTable = useReactTable({
    columns: memberColumns,
    data: members?.data ?? [],
    pageCount: members?.meta?.pageCount ?? 0,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: { pagination },
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

  const invitationsTable = useReactTable({
    columns: invitationColumns,
    data: invitations ?? [],
    getCoreRowModel: getCoreRowModel(),
  });

  const onSearch = (_search: string) => {
    setSearchText(_search);
    debouncedSetSearch(_search);
  };

  return (
    <AppContent>
      <AppHeader breadcrumbs={[{ title: "Members", to: "/$orgSlug/members", params: { orgSlug } }]}>
        <Can orgId={organization.id} permissions={{ member: ["create"] }}>
          <Button className="ml-auto" size="sm" onClick={() => setInviteDialogOpen(true)}>
            <RiAddLine data-icon="inline-start" />
            Invite Member
          </Button>
        </Can>
      </AppHeader>

      <AppBody>
        <Tabs
          value={search.tab}
          onValueChange={(value) => {
            navigate({ search: (prev) => ({ ...prev, tab: value }) });
          }}
        >
          <TabsList variant="line">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="flex flex-col gap-4">
            <div className="w-full">
              <div className="flex flex-wrap items-start gap-2.5">
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
                    <RiShieldUserLine data-icon="inline-start" />
                    <span className="text-muted-foreground">Role:</span> {toTitleCase(search.role ?? "all")}
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-32">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Role</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={search.role}
                        onValueChange={(value) => {
                          navigate({ search: { ...search, page: 1, role: value as typeof search.role } });
                        }}
                      >
                        <DropdownMenuRadioItem value={undefined} closeOnClick>
                          All
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="owner" closeOnClick>
                          Owner
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="admin" closeOnClick>
                          Admin
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="member" closeOnClick>
                          Member
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <DataTable
              table={membersTable}
              loading={loadingMembers}
              row={() => ({
                className: "group/table-row",
              })}
            />
          </TabsContent>

          <TabsContent value="invitations">
            <DataTable table={invitationsTable} loading={loadingInvitations} hidePagination />
          </TabsContent>
        </Tabs>
      </AppBody>

      <Can orgId={organization.id} permissions={{ member: ["create"] }}>
        <InviteMemberDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} orgId={organization.id} />
      </Can>
    </AppContent>
  );
}
