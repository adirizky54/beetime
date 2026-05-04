import { Outlet, createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { SidebarProvider } from "@beetime/ui/components/sidebar";

import { AppSidebar } from "@/components/layouts/app-sidebar";
import { OrgAccessDenied } from "@/components/errors/org-access-denied";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/$orgId")({
  beforeLoad: async ({ params }) => {
    const session = await auth.getSession();

    if (!session.data) {
      throw redirect({ to: "/login" });
    }

    if (session.data.session.activeOrganizationId !== params.orgId) {
      const { error } = await auth.organization.setActive({ organizationId: params.orgId });

      if (error && error.code === "USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION") {
        throw notFound();
      }
    }
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
