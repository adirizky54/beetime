import { RiBarChartLine, RiCalendarScheduleLine, RiTimerLine } from "@remixicon/react";
import { Link, linkOptions } from "@tanstack/react-router";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@beetime/ui/components/sidebar";

const MENU = [
  {
    id: "timer",
    title: "Timer",
    link: linkOptions({
      to: "/app/timer",
    }),
    icon: <RiTimerLine />,
  },
  {
    id: "timesheet",
    title: "Timesheet",
    link: linkOptions({
      to: "/app/timesheet",
    }),
    icon: <RiCalendarScheduleLine />,
  },
  {
    id: "reports",
    title: "Reports",
    link: linkOptions({
      to: "/app/reports",
    }),
    icon: <RiBarChartLine />,
  },
];

export function NavMenu() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-3">
          {MENU.map((menu) => (
            <SidebarMenuItem key={menu.id}>
              <SidebarMenuButton
                className="h-10 group-data-[collapsible=icon]:size-10! [&_svg]:size-6"
                tooltip={menu.title}
                render={<Link {...menu.link} preload={false} />}
              >
                {menu.icon}
                <span>{menu.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
