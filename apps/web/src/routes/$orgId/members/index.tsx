import { RiAddLine, RiLock2Line, RiSearchLine, RiShieldUserLine } from "@remixicon/react";
import { useDebouncedCallback } from "@tanstack/react-pacer/debouncer";
import { createFileRoute } from "@tanstack/react-router";
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
import { auth, type Invitation } from "@/lib/auth";
import { memberQueries } from "@/queries/member";
import { invitationQueries } from "@/queries/invitation";
import { useFormatDate } from "@/hooks/use-format-date";
import { getInitials, toTitleCase } from "@/utils/string";

const MembersPageSearchSchema = v.object({
  ...MemberQuerySchema.entries,
  tab: v.optional(v.picklist(["members", "invitations"]), "members"),
});

function JoinedDateCell({ date }: { date: Date | string }) {
  const formatted = useFormatDate(date, "datetime");
  return <span className="text-muted-foreground">{formatted}</span>;
}

function InvitationDateCell({ date }: { date: Date | string }) {
  const formatted = useFormatDate(date, "datetime");
  return <span className="text-muted-foreground">{formatted}</span>;
}

export const Route = createFileRoute("/$orgId/members/")({
  head: () => ({
    meta: [{ title: "Members — Bee Time" }],
  }),
  validateSearch: MembersPageSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { orgId } = Route.useParams();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const { data: session } = auth.useSession();

  const [searchText, setSearchText] = useState(search.search ?? "");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: members, isLoading: loadingMembers } = useQuery({
    ...memberQueries.list(orgId, search),
    enabled: search.tab === "members",
  });
  const { data: invitations, isLoading: loadingInvitations } = useQuery({
    ...invitationQueries.list(orgId),
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

              {member.userId !== session?.user.id ? <ActionsMember member={member} orgId={orgId} /> : null}
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => toTitleCase(row.original.role),
      },
      {
        accessorKey: "createdAt",
        header: "Joined at",
        cell: ({ row }) => <JoinedDateCell date={row.original.createdAt} />,
      },
    ],
    [orgId, session?.user.id],
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
              <ActionsInvitation invitation={inv} orgId={orgId} />
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
        cell: ({ row }) => <InvitationDateCell date={row.original.createdAt} />,
      },
      {
        accessorKey: "expiresAt",
        header: "Expires at",
        cell: ({ row }) => <InvitationDateCell date={row.original.expiresAt} />,
      },
    ],
    [orgId],
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
      <AppHeader breadcrumbs={[{ title: "Members", to: "/$orgId/members", params: { orgId } }]}>
        <Can orgId={orgId} permissions={{ member: ["create"] }}>
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

      <Can orgId={orgId} permissions={{ member: ["create"] }}>
        <InviteMemberDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} orgId={orgId} />
      </Can>
    </AppContent>
  );
}
