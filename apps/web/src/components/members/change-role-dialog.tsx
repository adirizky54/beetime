import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as v from "valibot";

import type { Member } from "@beetime/schema";
import { Button } from "@beetime/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@beetime/ui/components/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@beetime/ui/components/field";
import { Spinner } from "@beetime/ui/components/spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@beetime/ui/components/select";
import { toastManager } from "@beetime/ui/components/toast";

import { memberQueries } from "@/queries/member";

const ChangeRoleSchema = v.object({
  role: v.picklist(["owner", "admin", "member"], "Please select a role"),
});

type ChangeRoleInput = v.InferInput<typeof ChangeRoleSchema>;

interface ChangeRoleDialogProps {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}

const roles = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

export function ChangeRoleDialog({ member, open, onOpenChange, orgId }: ChangeRoleDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<ChangeRoleInput>({
    mode: "onChange",
    resolver: valibotResolver(ChangeRoleSchema),
    defaultValues: {
      role: member.role,
    },
  });

  const { mutate: updateMemberRole, isPending } = useMutation({
    ...memberQueries.updateMemberRole(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...memberQueries.listKey(), orgId] });
      toastManager.add({ type: "success", title: "Role updated" });
      handleOpenChange(false);
    },
    onError: (error) => {
      const message = error.message ?? "";
      toastManager.add({ type: "error", title: message || "Something went wrong. Please try again." });
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset({ role: member.role });
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = form.handleSubmit((values) => {
    updateMemberRole({ memberId: member.id, role: values.role });
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Update the role for <strong>{member.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form id="change-role-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="change-role-select">Role</FieldLabel>
                  <Select items={roles} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="change-role-select" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {roles.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="change-role-form"
            disabled={!form.formState.isValid || !form.formState.isDirty || isPending}
          >
            {isPending && <Spinner data-icon="inline-start" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
