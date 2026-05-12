import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { UpdateClientSchema, type Client, type UpdateClientInput } from "@beetime/schema";
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
import { Textarea } from "@beetime/ui/components/textarea";
import { toastManager } from "@beetime/ui/components/toast";

import { clientQueries } from "@/queries/client";

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
}

export function EditClientDialog({ open, onOpenChange, client }: EditClientDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<UpdateClientInput>({
    mode: "all",
    resolver: valibotResolver(UpdateClientSchema),
    values: {
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
    },
  });

  const updateClient = useMutation({
    ...clientQueries.update(client.organizationId, client.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientQueries.listKey() });
      toastManager.add({ type: "success", title: "Client updated" });
      handleOpenChange(false);
    },
    onError: (error) => {
      if (typeof error.data === "object") {
        if (error.response.status === 400) {
          const errors = error.data.errors;
          for (const key in errors) {
            form.setError(key as keyof UpdateClientInput, {
              type: "manual",
              message: errors[key][0],
            });
          }
        } else {
          toastManager.add({ type: "error", title: error.data.message });
        }
      } else {
        toastManager.add({ type: "error", title: "Something went wrong. Please try again." });
      }
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      updateClient.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors();
    updateClient.mutate(values);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>Update the details of your client.</DialogDescription>
        </DialogHeader>

        <form id="edit-client-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-client-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="edit-client-name"
                    placeholder="e.g. Acme Corporation"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-client-email">
                    Email
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    id="edit-client-email"
                    type="email"
                    placeholder="e.g. contact@acme.com"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-client-phone">
                    Phone
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    id="edit-client-phone"
                    type="tel"
                    placeholder="e.g. +1 (555) 000-0000"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-client-address">
                    Address
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    id="edit-client-address"
                    placeholder="e.g. 123 Main St, New York, NY 10001"
                    rows={3}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="edit-client-form"
            disabled={updateClient.isPending || !form.formState.isValid || !form.formState.isDirty}
          >
            {updateClient.isPending && <Spinner data-icon="inline-start" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
