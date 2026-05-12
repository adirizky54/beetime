import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Client } from "@beetime/schema";
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
import { toastManager } from "@beetime/ui/components/toast";

import { clientQueries } from "@/queries/client";

type DeleteClientDialogProps = {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteClientDialog({ client, open, onOpenChange }: DeleteClientDialogProps) {
  const queryClient = useQueryClient();

  const { mutate: deleteClient, isPending: isDeletingClient } = useMutation({
    ...clientQueries.delete(client.organizationId, client.id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: clientQueries.listKey() });
      toastManager.add({ type: "success", title: response.message });
      onOpenChange(false);
    },
    onError: () => {
      toastManager.add({ type: "error", title: "Failed to delete client" });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete client</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingClient}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isDeletingClient} onClick={() => deleteClient()}>
            {isDeletingClient && <Spinner data-icon="inline-start" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
