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

import { Can } from "@/components/ui/can";
import { ChangeRoleDialog } from "@/components/members/change-role-dialog";
import { RemoveMemberDialog } from "@/components/members/remove-member-dialog";

type ActionsMemberProps = {
  member: Member;
  orgId: string;
};

export function ActionsMember({ member, orgId }: ActionsMemberProps) {
  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

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
            <Can orgId={orgId} permissions={{ member: ["update"] }}>
              <DropdownMenuItem onClick={() => setShowChangeRoleDialog(true)} closeOnClick>
                <RiUserSettingsLine />
                Change Role...
              </DropdownMenuItem>
            </Can>

            <Can orgId={orgId} permissions={{ member: ["delete"] }}>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setShowRemoveDialog(true)} closeOnClick>
                <RiUserUnfollowLine />
                Remove Member
              </DropdownMenuItem>
            </Can>
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>

      <Can orgId={orgId} permissions={{ member: ["update"] }}>
        <ChangeRoleDialog
          member={member}
          open={showChangeRoleDialog}
          onOpenChange={setShowChangeRoleDialog}
          orgId={orgId}
        />
      </Can>

      <Can orgId={orgId} permissions={{ member: ["delete"] }}>
        <RemoveMemberDialog member={member} open={showRemoveDialog} onOpenChange={setShowRemoveDialog} orgId={orgId} />
      </Can>
    </>
  );
}
