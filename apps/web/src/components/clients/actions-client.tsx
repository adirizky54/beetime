import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RiArchiveLine, RiDeleteBinLine, RiHistoryLine, RiMoreFill, RiPencilFill } from "@remixicon/react";

import type { Client } from "@beetime/schema";
import { Button } from "@beetime/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beetime/ui/components/dropdown-menu";
import { toast } from "@beetime/ui/components/sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beetime/ui/components/tooltip";

import { Can } from "@/components/ui/can";
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog";
import { EditClientDialog } from "@/components/clients/edit-client-dialog";
import { clientQueries } from "@/queries/client";

type ActionsClientProps = {
  client: Client;
};

export function ActionsClient({ client }: ActionsClientProps) {
  const queryClient = useQueryClient();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { mutate: archive } = useMutation({
    ...clientQueries.archive(client.organizationId, client.id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: clientQueries.listKey() });
      toast.success(response.message);
    },
    onError: () => {
      toast.error("Failed to archive client");
    },
  });

  const { mutate: unarchive } = useMutation({
    ...clientQueries.unarchive(client.organizationId, client.id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: clientQueries.listKey() });
      toast.success(response.message);
    },
    onError: () => {
      toast.error("Failed to unarchive client");
    },
  });

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
          <TooltipContent>Client Actions</TooltipContent>
          <DropdownMenuContent className="min-w-40">
            <Can orgId={client.organizationId} permissions={{ client: ["update"] }}>
              <DropdownMenuItem onClick={() => setShowEditDialog(true)} closeOnClick>
                <RiPencilFill />
                Edit Client...
              </DropdownMenuItem>
            </Can>

            <Can orgId={client.organizationId} permissions={{ client: ["archive"] }}>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (client.archivedAt) {
                    unarchive();
                  } else {
                    archive();
                  }
                }}
                closeOnClick
              >
                {client.archivedAt ? <RiHistoryLine /> : <RiArchiveLine />}
                {client.archivedAt ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
            </Can>

            <Can orgId={client.organizationId} permissions={{ client: ["delete"] }}>
              <DropdownMenuItem variant="destructive" onClick={() => setShowDeleteDialog(true)} closeOnClick>
                <RiDeleteBinLine />
                Delete
              </DropdownMenuItem>
            </Can>
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>

      <Can orgId={client.organizationId} permissions={{ client: ["update"] }}>
        <EditClientDialog client={client} open={showEditDialog} onOpenChange={setShowEditDialog} />
      </Can>

      <Can orgId={client.organizationId} permissions={{ client: ["delete"] }}>
        <DeleteClientDialog client={client} open={showDeleteDialog} onOpenChange={setShowDeleteDialog} />
      </Can>
    </>
  );
}
