import { RiAccountCircleLine, RiLogoutBoxLine } from "@remixicon/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@beetime/ui/components/alert-dialog";
import { Avatar, AvatarFallback } from "@beetime/ui/components/avatar";
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

import { getInitials } from "@/utils/string";

export function NavUser() {
  const navigate = useNavigate();

  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const signOut = () => {
    setShowSignOutDialog(false);
    navigate({ to: "/login" });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="h-10 select-none group-data-[collapsible=icon]:size-10!" />}
          >
            <Avatar size="lg" className="rounded-lg after:rounded-lg">
              <AvatarFallback className="rounded-lg">{getInitials("Adi Rizky")}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56 rounded-lg" side="right" align="end" sideOffset={12}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="rounded-lg after:rounded-lg">
                    <AvatarFallback className="rounded-lg">{getInitials("Adi Rizky")}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight select-none">
                    <p className="truncate font-medium">Adi Rizky</p>
                    <p className="truncate text-xs">adirizky@gmail.com</p>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link to="/app/profile" preload={false} />}>
              <RiAccountCircleLine />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setShowSignOutDialog(true)}>
              <RiLogoutBoxLine />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to sign out of your account?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={signOut}>
                Sign out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
