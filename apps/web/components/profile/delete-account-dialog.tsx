import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";

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
import { Field, FieldError, FieldLabel } from "@beetime/ui/components/field";
import { Input } from "@beetime/ui/components/input";
import { Spinner } from "@beetime/ui/components/spinner";
import { toast } from "@beetime/ui/components/sonner";
import { DeleteAccountSchema, type DeleteAccountInput } from "@beetime/schema";

import { profileQueries } from "@/queries/profile";
import { auth } from "@/lib/auth";

export function DeleteAccountDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();

  const form = useForm<DeleteAccountInput>({
    mode: "onChange",
    resolver: valibotResolver(DeleteAccountSchema),
    defaultValues: {
      password: "",
    },
  });

  const { mutate: deleteAccount, isPending: isDeletingAccount } = useMutation({
    ...profileQueries.deleteAccount(),
    onSuccess: async () => {
      await auth.signOut();
      navigate({ to: "/login" });
    },
    onError: (error) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Something went wrong. Please try again.";
      toast.error(message);
    },
  });

  const onConfirm = form.handleSubmit((values) => {
    deleteAccount({ password: values.password });
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete account</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your account and all associated data. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="delete-password">Password</FieldLabel>
              <Input
                {...field}
                id="delete-password"
                type="password"
                placeholder="Your password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingAccount}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!form.formState.isValid || isDeletingAccount}
            onClick={onConfirm}
          >
            {isDeletingAccount && <Spinner data-icon="inline-start" />}
            Delete Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
