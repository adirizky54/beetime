import { useMemo, useState } from "react";
import { RiArrowDownSLine, RiCloseLine, RiSearchLine } from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Project } from "@beetime/schema";
import { Button } from "@beetime/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beetime/ui/components/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@beetime/ui/components/empty";
import { Skeleton } from "@beetime/ui/components/skeleton";
import { toastManager } from "@beetime/ui/components/toast";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@beetime/ui/components/input-group";

import { clientQueries } from "@/queries/client";
import { projectQueries } from "@/queries/project";

type ChangeClientProps = {
  project: Project;
};

export function ChangeClient({ project }: ChangeClientProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: clientsResponse, isLoading } = useQuery({
    ...clientQueries.listAll(project.organizationId, { status: "active" }),
    enabled: open,
  });
  const clients = clientsResponse?.data ?? [];

  const { mutate: updateClient, isPending } = useMutation({
    ...projectQueries.update(project.organizationId, project.id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: projectQueries.listKey() });
      toastManager.add({ type: "success", title: response.message });
    },
    onError: () => {
      toastManager.add({ type: "error", title: "Failed to update client" });
    },
  });

  const filtered = useMemo(
    () => (search ? clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) : clients),
    [clients, search],
  );
  const showNoClient = useMemo(() => !search || "no client".includes(search.toLowerCase()), [search]);

  const handleOpenChange = (next: boolean) => {
    if (!next) setSearch("");
    setOpen(next);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            size="sm"
            variant="link"
            className="h-auto px-0 text-foreground data-popup-open:[&_svg]:rotate-180 data-popup-open:[&_svg]:opacity-100"
          >
            {project.client ? project.client.name : <span className="text-muted-foreground">No Client</span>}
            <RiArrowDownSLine data-icon="inline-end" className="opacity-0 group-hover/table-row:opacity-100" />
          </Button>
        }
      />

      <DropdownMenuContent className="w-60 p-0">
        <div className="px-2 pt-2 pb-1">
          <InputGroup className="h-8">
            <InputGroupAddon align="inline-start">
              <RiSearchLine />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
            />
            {search && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" onClick={() => setSearch("")}>
                  <RiCloseLine />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>

        <DropdownMenuSeparator />

        <div className="max-h-60 overflow-y-auto p-1 pt-0">
          <DropdownMenuGroup>
            <DropdownMenuRadioGroup
              disabled={isPending}
              value={project.client?.id ?? ""}
              onValueChange={(value) =>
                updateClient({
                  clientId: value || null,
                  privacy: project.privacy,
                  userIds: project.members.map((m) => m.id),
                })
              }
            >
              {isLoading ? (
                <div className="space-y-1 p-1">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  {showNoClient && (
                    <DropdownMenuRadioItem value="" closeOnClick>
                      No Client
                    </DropdownMenuRadioItem>
                  )}

                  {filtered.length > 0
                    ? filtered.map((item) => (
                        <DropdownMenuRadioItem key={item.id} value={item.id} closeOnClick>
                          {item.name}
                        </DropdownMenuRadioItem>
                      ))
                    : !showNoClient && (
                        <Empty className="py-4">
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <RiSearchLine />
                            </EmptyMedia>
                            <EmptyTitle>No results</EmptyTitle>
                            <EmptyDescription>No clients found.</EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      )}
                </>
              )}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
