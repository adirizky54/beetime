import { Outlet, createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { SidebarProvider } from "@beetime/ui/components/sidebar";

import { AppSidebar } from "@/components/layouts/app-sidebar";
import { OrgAccessDenied } from "@/components/errors/org-access-denied";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/$orgSlug")({
  beforeLoad: async ({ context, params }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }

    const org = await auth.organization.getFullOrganization({
      query: {
        organizationSlug: params.orgSlug,
      },
    });

    if (org.error) {
      throw notFound();
    }

    if (context.session.activeOrganizationId !== org.data.id) {
      const { error } = await auth.organization.setActive({ organizationSlug: params.orgSlug });

      if (error && error.code === "USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION") {
        throw notFound();
      }
    }

    return {
      organization: {
        id: org.data.id,
        name: org.data.name,
        slug: org.data.slug,
        createdAt: org.data.createdAt,
        dateFormatted: org.data.dateFormat,
        intervalFormat: org.data.intervalFormat,
        timeFormat: org.data.timeFormat,
      },
    };
  },
  component: RouteComponent,
  notFoundComponent: OrgAccessDenied,
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <Outlet />
    </SidebarProvider>
  );
}
