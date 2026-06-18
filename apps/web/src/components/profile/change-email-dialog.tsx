import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation } from "@tanstack/react-query";

import { ChangeEmailSchema, type ChangeEmailInput } from "@beetime/schema";
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
import { Spinner } from "@beetime/ui/components/spinner";
import { toast } from "@beetime/ui/components/sonner";

import { profileQueries } from "@/queries/profile";

interface ChangeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeEmailDialog({ open, onOpenChange }: ChangeEmailDialogProps) {
  const form = useForm<ChangeEmailInput>({
    mode: "onChange",
    resolver: valibotResolver(ChangeEmailSchema),
    defaultValues: {
      newEmail: "",
    },
  });

  const {
    mutate: changeEmail,
    isPending,
    reset: resetMutation,
  } = useMutation({
    ...profileQueries.changeEmail(),
    onSuccess: () => {
      handleOpenChange(false);
      toast.success("Verification email sent. Check your inbox.");
    },
    onError: (error) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Something went wrong. Please try again.";
      toast.error(message);
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      resetMutation();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = form.handleSubmit((values) => {
    changeEmail(values);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change email address</DialogTitle>
          <DialogDescription>
            Enter a new email address. We'll send a verification link before applying the change.
          </DialogDescription>
        </DialogHeader>

        <form id="change-email-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="newEmail"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="new-email">New Email</FieldLabel>
                  <Input
                    {...field}
                    id="new-email"
                    type="email"
                    placeholder="new@example.com"
                    aria-invalid={fieldState.invalid}
                  />
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
          <Button type="submit" form="change-email-form" disabled={!form.formState.isValid || isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            Send verification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
