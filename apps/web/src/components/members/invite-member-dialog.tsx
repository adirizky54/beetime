import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
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

export function InviteMemberDialog({ open, onOpenChange, orgId: _orgId }: InviteMemberDialogProps) {
  const form = useForm<InviteMemberInput>({
    mode: "onChange",
    resolver: valibotResolver(InviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = form.handleSubmit((_values) => {
    // TODO: wire up mutation when API is ready
    handleOpenChange(false);
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
          <Button type="submit" form="invite-member-form" disabled={!form.formState.isValid}>
            Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
