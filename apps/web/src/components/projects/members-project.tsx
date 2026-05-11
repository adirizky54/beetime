import { useMemo, useState } from "react";
import { RiCloseLine, RiSearchLine, RiUserLine } from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Project } from "@beetime/schema";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@beetime/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beetime/ui/components/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@beetime/ui/components/empty";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@beetime/ui/components/input-group";
import { Skeleton } from "@beetime/ui/components/skeleton";
import { toastManager } from "@beetime/ui/components/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beetime/ui/components/tooltip";

import { getInitials } from "@/utils/string";
import { memberQueries } from "@/queries/member";
import { projectQueries } from "@/queries/project";

type MembersProjectProps = {
  project: Project;
};

function ProjectAvatarGroup({ project, ...props }: MembersProjectProps & React.ComponentProps<"div">) {
  return (
    <AvatarGroup className="inline-flex" {...props}>
      {project.members.map((member) => (
        <Avatar key={member.id} size="sm">
          <AvatarImage src={member.image ?? undefined} alt={member.name} />
          <AvatarFallback>
            {member.name ? getInitials(member.name) : <RiUserLine className="size-3.5" />}
          </AvatarFallback>
        </Avatar>
      ))}
    </AvatarGroup>
  );
}

function ProjectMembersTooltip({ project }: MembersProjectProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={<ProjectAvatarGroup project={project} />} />
      <TooltipContent className="flex flex-col items-start">
        {project.members.map((member) => (
          <p key={member.id}>{member.name}</p>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}

export function MembersProject({ project }: MembersProjectProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: membersResponse, isLoading } = useQuery({
    ...memberQueries.listAll(project.organizationId),
    enabled: open && project.privacy === "private",
  });
  const orgMembers = membersResponse?.data ?? [];

  const currentMemberIds = useMemo(() => project.members.map((m) => m.id), [project.members]);

  const filtered = useMemo(
    () => (search ? orgMembers.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())) : orgMembers),
    [orgMembers, search],
  );

  const { mutate: updateMembers, isPending } = useMutation({
    ...projectQueries.update(project.organizationId, project.id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: projectQueries.listKey() });
      toastManager.add({ type: "success", title: response.message });
    },
    onError: () => {
      toastManager.add({ type: "error", title: "Failed to update members" });
    },
  });

  const handleToggle = (memberId: string, checked: boolean) => {
    const next = checked ? [...currentMemberIds, memberId] : currentMemberIds.filter((id) => id !== memberId);

    updateMembers({
      privacy: project.privacy,
      clientId: project.clientId,
      userIds: next,
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setSearch("");
    setOpen(next);
  };

  if (project.privacy === "public") {
    return <ProjectMembersTooltip project={project} />;
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <DropdownMenuTrigger render={<TooltipTrigger render={<ProjectAvatarGroup project={project} />} />} />
        <TooltipContent className="flex flex-col items-start">
          {project.members.map((member) => (
            <p key={member.id}>{member.name}</p>
          ))}
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent className="w-60 p-0">
        <DropdownMenuGroup className="px-2 pt-2 pb-1">
          <DropdownMenuLabel className="px-0 pt-0 text-foreground">SELECT MEMBERS</DropdownMenuLabel>

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
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup className="max-h-60 overflow-y-auto p-1 pt-0">
          {isLoading ? (
            <div className="space-y-1 p-1">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((member) => {
              const checked = currentMemberIds.includes(member.userId);
              const isLast = checked && currentMemberIds.length === 1;
              return (
                <DropdownMenuCheckboxItem
                  key={member.id}
                  checked={checked}
                  disabled={isLast || isPending}
                  closeOnClick={false}
                  onCheckedChange={(next) => handleToggle(member.userId, next)}
                >
                  <Avatar size="sm">
                    <AvatarImage src={member.image ?? undefined} alt={member.name} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  {member.name}
                </DropdownMenuCheckboxItem>
              );
            })
          ) : (
            <Empty className="py-4">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <RiSearchLine />
                </EmptyMedia>
                <EmptyTitle>No results</EmptyTitle>
                <EmptyDescription>No members found.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
