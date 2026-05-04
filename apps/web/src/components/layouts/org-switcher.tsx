import { RiAddLine, RiArrowDownSLine, RiClockwise2Line } from "@remixicon/react";
import { useNavigate, Link } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beetime/ui/components/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@beetime/ui/components/sidebar";

import { auth } from "@/lib/auth";

export function OrgSwitcher() {
  const navigate = useNavigate();
  const { data: organizations } = auth.useListOrganizations();
  const { data: activeOrganization } = auth.useActiveOrganization();

  const setActiveOrganization = async (orgId: string) => {
    navigate({
      to: "/$orgId",
      params: { orgId },
    });

    await auth.organization.setActive({
      organizationId: orgId,
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton className="w-fit px-1.5" />}>
            <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <RiClockwise2Line className="size-3" />
            </div>
            <div className="grid flex-1">
              <span className="truncate font-medium">{activeOrganization?.name}</span>
            </div>
            <RiArrowDownSLine className="opacity-50 group-data-popup-open/menu-button:rotate-180" />
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64 rounded-lg" align="start" side="bottom" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Organizations</DropdownMenuLabel>
              {organizations?.map((org) => (
                <DropdownMenuItem key={org.id} className="gap-2 p-2" onClick={() => setActiveOrganization(org.id)}>
                  <div className="flex size-6 items-center justify-center rounded-xs border">
                    <RiClockwise2Line className="size-4 shrink-0" />
                  </div>
                  {org.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" render={<Link to="/create-organization" />}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <RiAddLine className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Create new organization</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
