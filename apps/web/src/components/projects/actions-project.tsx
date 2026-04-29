import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RiArchiveLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiHistoryLine,
  RiMoreFill,
  RiPencilFill,
} from "@remixicon/react";

import type { Project } from "@beetime/schema";
import { Button } from "@beetime/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beetime/ui/components/dropdown-menu";
import { toastManager } from "@beetime/ui/components/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beetime/ui/components/tooltip";

import { Can } from "@/components/ui/can";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { projectQueries } from "@/queries/project";

type ActionProjectProps = {
  project: Project;
};

export function ActionsProject({ project }: ActionProjectProps) {
  const queryClient = useQueryClient();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { mutate: archive } = useMutation({
    ...projectQueries.archive(project.organizationId, project.id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: projectQueries.listKey() });
      toastManager.add({ type: "success", title: response.message });
    },
    onError: () => {
      toastManager.add({ type: "error", title: "Failed to archive project" });
    },
  });

  const { mutate: unarchive } = useMutation({
    ...projectQueries.unarchive(project.organizationId, project.id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: projectQueries.listKey() });
      toastManager.add({ type: "success", title: response.message });
    },
    onError: () => {
      toastManager.add({ type: "error", title: "Failed to unarchive project" });
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
          <TooltipContent>Project Actions</TooltipContent>
          <DropdownMenuContent className="min-w-40">
            <Can orgId={project.organizationId} permissions={{ project: ["update"] }}>
              <DropdownMenuItem onClick={() => setShowEditDialog(true)} closeOnClick>
                <RiPencilFill />
                Edit Project...
              </DropdownMenuItem>
            </Can>
            <DropdownMenuItem closeOnClick>
              <RiFileCopyLine />
              Copy Project...
            </DropdownMenuItem>

            <Can orgId={project.organizationId} permissions={{ project: ["archive"] }}>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (project.archivedAt) {
                    unarchive();
                  } else {
                    archive();
                  }
                }}
                closeOnClick
              >
                {project.archivedAt ? <RiHistoryLine /> : <RiArchiveLine />}
                {project.archivedAt ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
            </Can>

            <Can orgId={project.organizationId} permissions={{ project: ["delete"] }}>
              <DropdownMenuItem variant="destructive" onClick={() => setShowDeleteDialog(true)} closeOnClick>
                <RiDeleteBinLine />
                Delete
              </DropdownMenuItem>
            </Can>
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>

      <Can orgId={project.organizationId} permissions={{ project: ["update"] }}>
        <EditProjectDialog project={project} open={showEditDialog} onOpenChange={setShowEditDialog} />
      </Can>

      <Can orgId={project.organizationId} permissions={{ project: ["delete"] }}>
        <DeleteProjectDialog project={project} open={showDeleteDialog} onOpenChange={setShowDeleteDialog} />
      </Can>
    </>
  );
}
