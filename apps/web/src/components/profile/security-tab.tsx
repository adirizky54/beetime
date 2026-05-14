import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";

import { Button } from "@beetime/ui/components/button";
import { Input } from "@beetime/ui/components/input";
import { Spinner } from "@beetime/ui/components/spinner";
import { toastManager } from "@beetime/ui/components/toast";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@beetime/ui/components/field";
import { ChangePasswordSchema, type ChangePasswordInput } from "@beetime/schema";

import { profileQueries } from "@/queries/profile";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";

export function SecurityTab() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const passwordForm = useForm<ChangePasswordInput>({
    mode: "onChange",
    resolver: valibotResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutate: changePassword, isPending: isChangingPassword } = useMutation({
    ...profileQueries.changePassword(),
    onSuccess: () => {
      toastManager.add({ type: "success", title: "Password changed" });
      passwordForm.reset();
    },
    onError: (error) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Something went wrong. Please try again.";
      toastManager.add({ type: "error", title: message });
    },
  });

  const onSubmitPassword = passwordForm.handleSubmit((values) => {
    changePassword(values);
  });

  return (
    <div className="flex flex-col gap-6 pt-4">
      <form onSubmit={onSubmitPassword}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Change Password</FieldLegend>
            <FieldDescription>Update your account password.</FieldDescription>
            <FieldGroup>
              <Controller
                name="currentPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
                    <Input
                      {...field}
                      id="current-password"
                      type="password"
                      placeholder="Your current password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="newPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                    <Input
                      {...field}
                      id="new-password"
                      type="password"
                      placeholder="Your new password"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
                    <Input
                      {...field}
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <Field orientation="horizontal" className="justify-end">
            <Button
              type="submit"
              disabled={!passwordForm.formState.isDirty || !passwordForm.formState.isValid || isChangingPassword}
            >
              {isChangingPassword && <Spinner data-icon="inline-start" />}
              Change Password
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Connected Accounts</FieldLegend>
        <FieldDescription>OAuth provider connections.</FieldDescription>
        <p className="text-sm text-muted-foreground">OAuth provider connections coming soon.</p>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend className="text-destructive">Danger Zone</FieldLegend>
        <FieldDescription>Irreversible actions for your account.</FieldDescription>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
          </div>
          <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            Delete Account
          </Button>
        </div>
      </FieldSet>

      <DeleteAccountDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
    </div>
  );
}
