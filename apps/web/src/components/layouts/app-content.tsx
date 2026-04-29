import { SidebarInset } from "@beetime/ui/components/sidebar";

export function AppContent({ children, ...props }: React.ComponentProps<typeof SidebarInset>) {
  return <SidebarInset {...props}>{children}</SidebarInset>;
}
