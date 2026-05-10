import { useState } from "react";
import { RiMoreFill, RiUserSettingsLine, RiUserUnfollowLine } from "@remixicon/react";

import type { Member } from "@beetime/schema";
import { Button } from "@beetime/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beetime/ui/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beetime/ui/components/tooltip";

import { ChangeRoleDialog } from "@/components/members/change-role-dialog";
import { RemoveMemberDialog } from "@/components/members/remove-member-dialog";

type ActionsMemberProps = {
  canUpdate: boolean;
  canDelete: boolean;
  member: Member;
  orgId: string;
};

export function ActionsMember({ canUpdate, canDelete, member, orgId }: ActionsMemberProps) {
  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const canShowActions = canUpdate || canDelete;

  if (!canShowActions) {
    return null;
  }

  return (
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
          <TooltipContent>Member Actions</TooltipContent>

          <DropdownMenuContent className="min-w-40">
            {canUpdate ? (
              <DropdownMenuItem onClick={() => setShowChangeRoleDialog(true)} closeOnClick>
                <RiUserSettingsLine />
                Change Role...
              </DropdownMenuItem>
            ) : null}

            {canDelete ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setShowRemoveDialog(true)} closeOnClick>
                  <RiUserUnfollowLine />
                  Remove Member
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>

      {canUpdate ? (
        <ChangeRoleDialog
          member={member}
          open={showChangeRoleDialog}
          onOpenChange={setShowChangeRoleDialog}
          orgId={orgId}
        />
      ) : null}

      {canDelete ? (
        <RemoveMemberDialog member={member} open={showRemoveDialog} onOpenChange={setShowRemoveDialog} orgId={orgId} />
      ) : null}
    </>
  );
}
