import { useState } from "react";
import { RiMoreFill, RiUserForbidLine } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@beetime/ui/components/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@beetime/ui/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beetime/ui/components/tooltip";
import { toastManager } from "@beetime/ui/components/toast";

import { Can } from "@/components/ui/can";
import type { Invitation } from "@/lib/auth";
import { invitationQueries } from "@/queries/invitation";

type ActionsInvitationProps = {
  invitation: Invitation;
  orgId: string;
};

export function ActionsInvitation({ invitation, orgId }: ActionsInvitationProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: cancelInvitation, isPending: isCancellingInvitation } = useMutation({
    ...invitationQueries.cancel(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationQueries.listKey(orgId) });
      toastManager.add({ type: "success", title: "Invitation cancelled" });
      setShowCancelDialog(false);
    },
    onError: (error) => {
      const message = error.message ?? "";
      toastManager.add({ type: "error", title: message || "Something went wrong. Please try again." });
      setShowCancelDialog(false);
    },
  });

  if (invitation.status !== "pending") {
    return null;
  }

  return (
    <Can orgId={orgId} permissions={{ invitation: ["cancel"] }}>
      <>
        <Tooltip>
          <DropdownMenu>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 group-hover/table-row:opacity-100 data-popup-open:opacity-100"
                    >
                      <RiMoreFill className="size-4" />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent>Invitation Actions</TooltipContent>

            <DropdownMenuContent className="min-w-40">
              <DropdownMenuItem variant="destructive" onClick={() => setShowCancelDialog(true)} closeOnClick>
                <RiUserForbidLine />
                Cancel Invitation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Tooltip>

        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel invitation?</AlertDialogTitle>
              <AlertDialogDescription>
                The invitation to <strong>{invitation.email}</strong> will be cancelled immediately. They will no longer
                be able to join using this invite link.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isCancellingInvitation}
                onClick={() => cancelInvitation(invitation.id)}
              >
                Cancel Invitation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </Can>
  );
}
