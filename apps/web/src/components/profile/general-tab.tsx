import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@beetime/ui/components/avatar";
import { Button } from "@beetime/ui/components/button";
import { Input } from "@beetime/ui/components/input";
import { Spinner } from "@beetime/ui/components/spinner";
import { toastManager } from "@beetime/ui/components/toast";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@beetime/ui/components/field";

import { UpdateProfileSchema, type UpdateProfileInput } from "@beetime/schema";

import { profileQueries } from "@/queries/profile";
import { getInitials } from "@/utils/string";
import { ChangeEmailDialog } from "@/components/profile/change-email-dialog";

export function GeneralTab() {
  const { user } = useRouteContext({ from: "__root__" });
  const currentUser = user!;
  const queryClient = useQueryClient();
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);

  const profileForm = useForm<UpdateProfileInput>({
    mode: "onChange",
    resolver: valibotResolver(UpdateProfileSchema),
    defaultValues: {
      name: currentUser.name,
      image: currentUser.image ?? null,
    },
  });

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    ...profileQueries.updateProfile(),
    onSuccess: () => {
      toastManager.add({ type: "success", title: "Profile updated" });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      profileForm.reset(profileForm.getValues());
    },
    onError: (error) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Something went wrong. Please try again.";
      toastManager.add({ type: "error", title: message });
    },
  });

  const onSubmitProfile = profileForm.handleSubmit((values) => {
    updateProfile(values);
  });

  return (
    <div className="flex flex-col gap-6 pt-4">
      <form onSubmit={onSubmitProfile}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Profile</FieldLegend>
            <FieldGroup>
              <Controller
                name="image"
                control={profileForm.control}
                render={({ field }) => (
                  <Field orientation="horizontal" className="items-center gap-4">
                    <Avatar className="size-16">
                      <AvatarImage src={field.value ?? undefined} alt={currentUser.name} />
                      <AvatarFallback className="text-lg">
                        {getInitials(profileForm.watch("name") || currentUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <FieldLabel>Avatar URL</FieldLabel>
                      <Input
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        placeholder="https://example.com/avatar.png"
                      />
                      <FieldLabel className="font-normal text-muted-foreground">
                        Enter a URL for your profile picture.
                      </FieldLabel>
                    </div>
                  </Field>
                )}
              />

              <FieldSeparator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  name="name"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="profile-name">Display Name</FieldLabel>
                      <Input
                        {...field}
                        id="profile-name"
                        autoComplete="name"
                        placeholder="Your name"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Field>
                  <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                  <Input id="profile-email" value={currentUser.email} disabled />
                  <button
                    type="button"
                    onClick={() => setChangeEmailOpen(true)}
                    className="text-left text-sm text-foreground underline underline-offset-4 hover:no-underline"
                  >
                    Change email
                  </button>
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <Field orientation="horizontal" className="justify-end">
            <Button
              type="submit"
              disabled={!profileForm.formState.isDirty || !profileForm.formState.isValid || isUpdatingProfile}
            >
              {isUpdatingProfile && <Spinner data-icon="inline-start" />}
              Save Changes
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <ChangeEmailDialog open={changeEmailOpen} onOpenChange={setChangeEmailOpen} />
    </div>
  );
}
