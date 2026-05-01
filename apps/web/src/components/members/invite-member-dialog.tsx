import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as v from "valibot";

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
import { Input } from "@beetime/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@beetime/ui/components/select";
import { Spinner } from "@beetime/ui/components/spinner";
import { toastManager } from "@beetime/ui/components/toast";

import { memberQueries } from "@/queries/member";

const InviteMemberSchema = v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Email must not be empty"),
    v.email("Please enter a valid email address"),
  ),
  role: v.picklist(["admin", "member"], "Please select a role"),
});

type InviteMemberInput = v.InferInput<typeof InviteMemberSchema>;

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}

const roles = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

export function InviteMemberDialog({ open, onOpenChange, orgId }: InviteMemberDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<InviteMemberInput>({
    mode: "onChange",
    resolver: valibotResolver(InviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const invite = useMutation({
    ...memberQueries.invite(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueries.listKey() });
      queryClient.invalidateQueries({ queryKey: memberQueries.listInvitationsKey(orgId) });
      toastManager.add({ type: "success", title: "Invitation sent" });
      handleOpenChange(false);
    },
    onError: (error) => {
      const message = error.message;
      form.setError("email", { type: "manual", message });
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      invite.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors();
    invite.mutate(values);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>Invite someone to join your organization.</DialogDescription>
        </DialogHeader>

        <form id="invite-member-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="invite-member-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="invite-member-email"
                    type="email"
                    placeholder="e.g. jane@example.com"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="invite-member-role">Role</FieldLabel>
                  <Select items={roles} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="invite-member-role" aria-invalid={fieldState.invalid}>
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
          <Button type="submit" form="invite-member-form" disabled={invite.isPending || !form.formState.isValid}>
            {invite.isPending && <Spinner data-icon="inline-start" />}
            Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
