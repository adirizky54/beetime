import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@beetime/ui/components/sidebar";
import { NavMenu } from "@/components/layouts/nav-menu";
import { NavUser } from "@/components/layouts/nav-user";
import { OrgSwitcher } from "@/components/layouts/org-switcher";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMenu />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
