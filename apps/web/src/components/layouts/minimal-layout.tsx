import { useState } from "react";
import { RiAccountCircleLine, RiLogoutBoxLine } from "@remixicon/react";
import { Link, useNavigate } from "@tanstack/react-router";

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
import { Avatar, AvatarFallback, AvatarImage } from "@beetime/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beetime/ui/components/dropdown-menu";

import { auth } from "@/lib/auth";
import { Button } from "@beetime/ui/components/button";

export function MinimalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh w-full flex-1 flex-col bg-muted">
      <Header />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid min-h-svh flex-1 place-items-center rounded-xl bg-background p-4 md:min-h-min">
          {children}
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4">
      <div className="flex grow items-center">
        <Link to="/">
          <img src="https://shadcnuikit.com/logo.png" className="size-8 rounded-md" alt="" />
        </Link>
      </div>

      <NavUser />
    </header>
  );
}

function NavUser() {
  const navigate = useNavigate();
  const { data } = auth.useSession();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const signOut = () => {
    setShowSignOutDialog(false);
    auth.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: "/login" });
        },
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="lg" variant="ghost" className="p-0" />}>
          <Avatar>
            <AvatarImage src="https://ui.shadcn.com/avatars/shadcn.jpg" alt={data?.user.name} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-56 rounded-lg" side="bottom" align="end" sideOffset={4}>
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar>
                  <AvatarImage src="https://ui.shadcn.com/avatars/shadcn.jpg" alt={data?.user.name} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{data?.user.name}</span>
                  <span className="truncate text-xs">{data?.user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <RiAccountCircleLine />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowSignOutDialog(true)}>
            <RiLogoutBoxLine />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
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
    </>
  );
}
