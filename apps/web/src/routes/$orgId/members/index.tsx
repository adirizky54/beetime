import { RiAddLine, RiSearchLine, RiShieldUserLine } from "@remixicon/react";
import { useDebouncedCallback } from "@tanstack/react-pacer/debouncer";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

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

import { Can } from "@/components/ui/can";
import { DataTable } from "@/components/ui/data-table";
import { AppBody } from "@/components/layouts/app-body";
import { AppContent } from "@/components/layouts/app-content";
import { AppHeader } from "@/components/layouts/app-header";
import { ActionsMember } from "@/components/members/actions-member";
import { InviteMemberDialog } from "@/components/members/invite-member-dialog";
import { auth } from "@/lib/auth";
import { memberQueries } from "@/queries/member";
import { useFormatDate } from "@/hooks/use-format-date";
import { getInitials, toTitleCase } from "@/utils/string";

function JoinedDateCell({ date }: { date: string }) {
  const formatted = useFormatDate(date, "datetime");
  return <span className="text-muted-foreground">{formatted}</span>;
}

export const Route = createFileRoute("/$orgId/members/")({
  head: () => ({
    meta: [{ title: "Members — Bee Time" }],
  }),
  validateSearch: MemberQuerySchema,
  component: RouteComponent,
});

function getRoleBadgeClassName(role: Member["role"]) {
  switch (role) {
    case "owner":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "admin":
      return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "member":
      return undefined;
  }
}

function RouteComponent() {
  const { orgId } = Route.useParams();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const { data: session } = auth.useSession();

  const [searchText, setSearchText] = useState(search.search ?? "");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: members, isLoading: loadingMembers } = useQuery(memberQueries.list(orgId, search));

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

  const columns = useMemo<Array<ColumnDef<Member>>>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarImage src={m.image ?? undefined} alt={m.name} />
                <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
              </Avatar>

              <span className="truncate font-medium">{m.name}</span>

              {m.banned && <Badge variant="destructive">Banned</Badge>}

              <ActionsMember member={m} orgId={orgId} currentUserId={session?.user.id} />
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
        cell: ({ row }) => {
          const role = row.original.role;
          return (
            <Badge variant="outline" className={getRoleBadgeClassName(role)}>
              {toTitleCase(role)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Joined at",
        cell: ({ row }) => <JoinedDateCell date={row.original.createdAt} />,
      },
    ],
    [orgId, session?.user.id],
  );

  const table = useReactTable({
    columns,
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
          table={table}
          loading={loadingMembers}
          row={() => ({
            className: "group/table-row",
          })}
        />
      </AppBody>

      <Can orgId={orgId} permissions={{ member: ["create"] }}>
        <InviteMemberDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} orgId={orgId} />
      </Can>
    </AppContent>
  );
}
