import { RiUserLine } from "@remixicon/react";

import type { Project } from "@beetime/schema";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@beetime/ui/components/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beetime/ui/components/tooltip";

type MembersProjectProps = {
  project: Project;
};

export function MembersProject({ project }: MembersProjectProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <AvatarGroup className="inline-flex">
            {project.members.map((member) => (
              <Avatar key={member.id} size="sm">
                <AvatarImage src={member.image ?? undefined} alt={member.name} />
                <AvatarFallback>
                  <RiUserLine className="size-3.5" />
                </AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        }
      />

      <TooltipContent className="flex flex-col items-start">
        {project.members.map((member) => (
          <p key={member.id}>{member.name}</p>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}
