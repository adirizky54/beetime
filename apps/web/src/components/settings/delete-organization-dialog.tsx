import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

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

import { organizationQueries } from "@/queries/organization";

type DeleteOrganizationDialogProps = {
  orgId: string;
  orgName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteOrganizationDialog({ orgId, orgName, open, onOpenChange }: DeleteOrganizationDialogProps) {
  const navigate = useNavigate();

  const { mutate: deleteOrganization, isPending: isDeletingOrganization } = useMutation({
    ...organizationQueries.delete(orgId),
    onSuccess: async () => {
      toast.success("Organization deleted");
      navigate({ to: "/" });
    },
    onError: () => {
      toast.error("Failed to delete organization. Please try again.");
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete organization</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{orgName}</strong>? All projects, clients, members, and time entries
            will be permanently removed. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingOrganization}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeletingOrganization}
            onClick={() => deleteOrganization()}
          >
            {isDeletingOrganization && <Spinner data-icon="inline-start" />}
            Delete Organization
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
