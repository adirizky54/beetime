import { RiArrowRightSLine, RiFolderLine } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@beetime/ui/components/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@beetime/ui/components/collapsible";
import { ScrollArea } from "@beetime/ui/components/scroll-area";
import { Skeleton } from "@beetime/ui/components/skeleton";
import type { Project } from "@beetime/schema";

import type { Organization } from "@/lib/auth";
import { organizationQueries } from "@/queries/organization";
import { projectQueries } from "@/queries/project";

// TODO: Make new endpoint to get all projects grouped by orgs based on user logged in

export function OrgProjectPanel() {
  const { data: organizations, isLoading: loadingOrganizations } = useQuery(organizationQueries.list());

  if (loadingOrganizations) {
    return (
      <aside className="flex w-56 shrink-0 flex-col border-r">
        <div className="flex flex-col gap-1 px-1 py-2">
          <div className="w-full p-1">
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="flex w-full flex-col gap-0.5 px-1 pt-0.5 pl-4.5">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>

          <div className="w-full p-1">
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="flex w-full flex-col gap-0.5 px-1 pt-0.5 pl-4.5">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r">
      <ScrollArea className="h-[calc(100svh-4rem)]">
        <div className="flex flex-col gap-1 px-1 py-2">
          {organizations?.map((organization) => (
            <OrganizationItem key={organization.id} organization={organization} />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}

function OrganizationItem({ organization }: { organization: Organization }) {
  const { data: projects, isLoading: loadingProjects } = useQuery(
    projectQueries.list(organization.id, {
      status: "active",
      page: 1,
      pageSize: 100,
    }),
  );

  if (projects?.data?.length === 0) {
    return null;
  }

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="group flex w-full items-center gap-1 p-1 text-foreground select-none">
        <RiArrowRightSLine className="size-4 shrink-0 transition-transform duration-200 ease-in-out group-aria-expanded:rotate-90" />
        <span className="min-w-0 flex-1 truncate text-left text-sm/4 font-medium">{organization.name}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-1 pt-0.5">
        <Projects projects={projects?.data ?? []} loading={loadingProjects} />
      </CollapsibleContent>
    </Collapsible>
  );
}

function Projects({ projects, loading }: { projects: Project[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-0.5 pl-4.5">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {projects.map((project) => (
        <Button key={project.id} variant="ghost" size="sm" className="justify-start gap-1.5 pl-4.5! font-normal">
          <RiFolderLine data-icon="inline-start" />
          <span className="truncate">{project.name}</span>
        </Button>
      ))}
    </div>
  );
}
