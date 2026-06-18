import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Project } from "@beetime/schema";
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
import { Spinner } from "@beetime/ui/components/spinner";
import { toast } from "@beetime/ui/components/sonner";

import { projectQueries } from "@/queries/project";

type DeleteProjectDialogProps = {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteProjectDialog({ project, open, onOpenChange }: DeleteProjectDialogProps) {
  const queryClient = useQueryClient();

  const { mutate: deleteProject, isPending: isDeletingProject } = useMutation({
    ...projectQueries.delete(project.organizationId, project.id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: projectQueries.listKey() });
      toast.success(response.message);
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingProject}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isDeletingProject} onClick={() => deleteProject()}>
            {isDeletingProject && <Spinner data-icon="inline-start" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
