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
  const { orgSlug } = useParams({ from: "/$orgSlug" });

  const menu = [
    {
      id: "main",
      title: null,
      items: [
        {
          id: "dashboard",
          title: "Dashboard",
          link: linkOptions({
            to: "/$orgSlug/dashboard",
            params: { orgSlug },
          }),
          icon: <RiDashboardFill />,
        },
        {
          id: "timesheet",
          title: "Timesheet",
          link: linkOptions({
            to: "/$orgSlug/timesheet",
            params: { orgSlug },
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
            to: "/$orgSlug/projects",
            params: { orgSlug },
          }),
          icon: <RiFolder3Fill />,
        },
        {
          id: "clients",
          title: "Clients",
          link: linkOptions({
            to: "/$orgSlug/clients",
            params: { orgSlug },
          }),
          icon: <RiAccountCircleFill />,
        },
        {
          id: "members",
          title: "Members",
          link: linkOptions({
            to: "/$orgSlug/members",
            params: { orgSlug },
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
            to: "/$orgSlug/settings",
            params: { orgSlug },
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
              <SidebarMenuButton tooltip={item.title} render={<Link {...item.link} preload={false} />}>
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
