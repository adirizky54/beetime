import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Member } from "@beetime/schema";
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

import { memberQueries } from "@/queries/member";

type RemoveMemberDialogProps = {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
};

export function RemoveMemberDialog({ member, open, onOpenChange, orgId }: RemoveMemberDialogProps) {
  const queryClient = useQueryClient();

  const { mutate: removeMember, isPending: isRemovingMember } = useMutation({
    ...memberQueries.removeMember(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...memberQueries.listKey(), orgId] });
      toast.success("Member removed");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to remove member");
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{member.name}</strong> will lose access to this organization immediately. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemovingMember}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isRemovingMember} onClick={() => removeMember(member.id)}>
            {isRemovingMember && <Spinner data-icon="inline-start" />}
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
