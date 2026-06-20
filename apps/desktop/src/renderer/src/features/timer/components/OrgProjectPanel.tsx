import { RiArrowDownSLine, RiFolderLine } from "@remixicon/react";

import { Badge } from "@beetime/ui/components/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@beetime/ui/components/collapsible";
import { ScrollArea } from "@beetime/ui/components/scroll-area";

import type { MockOrg, MockProject } from "@/features/timer/data/mock";

interface OrgProjectPanelProps {
  orgs: MockOrg[];
  projects: MockProject[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
}

export function OrgProjectPanel({ orgs, projects, selectedProjectId, onSelectProject }: OrgProjectPanelProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r">
      <ScrollArea>
        <div className="flex flex-col gap-1 p-3">
          {orgs.map((org) => {
            const orgProjects = projects.filter((p) => p.organizationId === org.id);

            return (
              <Collapsible key={org.id} defaultOpen>
                <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted">
                  <RiArrowDownSLine className="size-4 shrink-0 text-muted-foreground transition-transform group-data-open:rotate-180" />
                  <span className="flex-1 text-left">{org.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {orgProjects.length}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-0.5 ml-1 flex flex-col gap-0.5">
                  {orgProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => onSelectProject(project.id)}
                      className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                        selectedProjectId === project.id
                          ? "bg-accent font-medium text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <RiFolderLine className="size-4 shrink-0" />
                      {project.name}
                    </button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
