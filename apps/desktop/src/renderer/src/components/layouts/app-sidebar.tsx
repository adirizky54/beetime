import { Sidebar, SidebarContent, SidebarHeader } from "@beetime/ui/components/sidebar";
import { NavMenu } from "@/components/layouts/nav-menu";
import { NavUser } from "@/components/layouts/nav-user";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" showOnMobile {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        <NavMenu />
      </SidebarContent>
    </Sidebar>
  );
}
