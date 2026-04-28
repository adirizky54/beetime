import {
  RiAccountCircleFill,
  RiCalendarScheduleFill,
  RiDashboardFill,
  RiFolder3Fill,
  RiGroupFill,
  RiSettings3Fill,
} from "@remixicon/react";
import { Link, linkOptions, useParams } from "@tanstack/react-router";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@beetime/ui/components/sidebar";

export function NavMenu() {
  const { orgId } = useParams({ from: "/$orgId" });

  const menu = [
    {
      id: "main",
      title: null,
      items: [
        {
          id: "dashboard",
          title: "Dashboard",
          link: linkOptions({
            to: "/$orgId",
            params: { orgId },
          }),
          icon: <RiDashboardFill />,
        },
        {
          id: "timesheet",
          title: "Timesheet",
          link: linkOptions({
            to: "/$orgId/timesheet",
            params: { orgId },
          }),
          icon: <RiCalendarScheduleFill />,
        },
      ],
    },
    {
      id: "manage",
      title: "Manage",
      items: [
        {
          id: "projects",
          title: "Projects",
          link: linkOptions({
            to: "/$orgId/projects",
            params: { orgId },
          }),
          icon: <RiFolder3Fill />,
        },
        {
          id: "clients",
          title: "Clients",
          link: linkOptions({
            to: "/$orgId/clients",
            params: { orgId },
          }),
          icon: <RiAccountCircleFill />,
        },
        {
          id: "members",
          title: "Members",
          link: linkOptions({
            to: "/$orgId/members",
            params: { orgId },
          }),
          icon: <RiGroupFill />,
        },
      ],
    },
    {
      id: "other",
      title: null,
      items: [
        {
          id: "settings",
          title: "Settings",
          link: linkOptions({
            to: "/$orgId/settings",
            params: { orgId },
          }),
          icon: <RiSettings3Fill />,
        },
      ],
    },
  ];

  return menu.map((group) => (
    <SidebarGroup key={group.id}>
      {group.title ? <SidebarGroupLabel>{group.title}</SidebarGroupLabel> : null}
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                tooltip={item.title}
                render={<Link {...item.link} preload={false} activeOptions={{ exact: true, includeSearch: false }} />}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ));
}
