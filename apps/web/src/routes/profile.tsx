import { createFileRoute, redirect, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState } from "react";
import { RiArrowLeftLine, RiComputerLine, RiSmartphoneLine } from "@remixicon/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beetime/ui/components/tabs";
import { Button } from "@beetime/ui/components/button";
import { Input } from "@beetime/ui/components/input";
import { Avatar, AvatarFallback, AvatarImage } from "@beetime/ui/components/avatar";
import { Badge } from "@beetime/ui/components/badge";
import { Spinner } from "@beetime/ui/components/spinner";
import { toastManager } from "@beetime/ui/components/toast";
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
import {
  UpdateProfileSchema,
  ChangeEmailSchema,
  ChangePasswordSchema,
  DeleteAccountSchema,
  type UpdateProfileInput,
  type ChangeEmailInput,
  type ChangePasswordInput,
  type DeleteAccountInput,
} from "@beetime/schema";

import { profileQueries } from "@/queries/profile";
import { auth } from "@/lib/auth";
import { getInitials } from "@/utils/string";
import { parseUserAgent } from "@/utils/user-agent";

export const Route = createFileRoute("/profile")({
  beforeLoad: async ({ context }) => {
    if (!context.session) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [{ title: "Profile — Bee Time" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh flex-col bg-muted">
      <div className="flex items-center gap-2 border-b bg-background px-6 py-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <RiArrowLeftLine />
          Back
        </Button>
      </div>
      <div className="flex flex-1 justify-center px-4 py-8">
        <div className="flex w-full max-w-2xl flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account settings</p>
          </div>
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <GeneralTab />
            </TabsContent>
            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>
            <TabsContent value="sessions">
              <SessionsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function GeneralTab() {
  const { user } = Route.useRouteContext();
  const currentUser = user!;
  const queryClient = useQueryClient();

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

  const emailForm = useForm<ChangeEmailInput>({
    mode: "onChange",
    resolver: valibotResolver(ChangeEmailSchema),
    defaultValues: {
      newEmail: "",
    },
  });

  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);

  const { mutate: changeEmail, isPending: isChangingEmail } = useMutation({
    ...profileQueries.changeEmail(),
    onSuccess: (_data, variables) => {
      setEmailSentTo(variables.newEmail);
      emailForm.reset();
    },
    onError: (error) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Something went wrong. Please try again.";
      toastManager.add({ type: "error", title: message });
    },
  });

  const onSubmitEmail = emailForm.handleSubmit((values) => {
    changeEmail(values);
  });

  return (
    <div className="flex flex-col gap-6 pt-4">
      <form onSubmit={onSubmitProfile}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Profile</FieldLegend>
            <FieldDescription>Your display name and avatar.</FieldDescription>
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
                      <FieldDescription>Enter a URL for your profile picture.</FieldDescription>
                    </div>
                  </Field>
                )}
              />

              <FieldSeparator />

              <Controller
                name="name"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-name">Display Name</FieldLabel>
                    <Input {...field} id="profile-name" placeholder="Your name" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
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

      <FieldSeparator />

      <form onSubmit={onSubmitEmail}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Email Address</FieldLegend>
            <FieldDescription>Change the email address associated with your account.</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel>Current Email</FieldLabel>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              </Field>

              <Controller
                name="newEmail"
                control={emailForm.control}
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

              {emailSentTo && (
                <FieldDescription>
                  Verification email sent to <strong>{emailSentTo}</strong>. Check your inbox.
                </FieldDescription>
              )}
            </FieldGroup>
          </FieldSet>

          <Field orientation="horizontal" className="justify-end">
            <Button
              type="submit"
              disabled={!emailForm.formState.isDirty || !emailForm.formState.isValid || isChangingEmail}
            >
              {isChangingEmail && <Spinner data-icon="inline-start" />}
              Change Email
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}

function SecurityTab() {
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

function DeleteAccountDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
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
      toastManager.add({ type: "error", title: message });
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

function SessionsTab() {
  const context = useRouteContext({ from: "__root__" });
  const currentToken = context.session?.token;
  const queryClient = useQueryClient();

  const { data: sessionsData, isPending: isLoadingSessions } = useQuery(profileQueries.sessions());
  const sessions = Array.isArray(sessionsData) ? sessionsData : [];

  const { mutate: revokeSession } = useMutation({
    ...profileQueries.revokeSession(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueries.sessionsKey() });
    },
    onError: (error) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Something went wrong. Please try again.";
      toastManager.add({ type: "error", title: message });
    },
  });

  const { mutate: revokeOtherSessions, isPending: isRevokingOthers } = useMutation({
    ...profileQueries.revokeOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueries.sessionsKey() });
      toastManager.add({ type: "success", title: "All other sessions revoked" });
    },
    onError: (error) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Something went wrong. Please try again.";
      toastManager.add({ type: "error", title: message });
    },
  });

  if (isLoadingSessions) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Active Sessions</p>
          <p className="text-sm text-muted-foreground">Devices currently signed in to your account.</p>
        </div>
        <Button variant="outline" size="sm" disabled={isRevokingOthers} onClick={() => revokeOtherSessions()}>
          {isRevokingOthers && <Spinner data-icon="inline-start" />}
          Revoke all other sessions
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {sessions.map((session) => {
          const { browser, os, device } = parseUserAgent(session.userAgent);
          const isCurrent = session.token === currentToken;

          return (
            <div key={session.id} className="flex items-start justify-between gap-4 rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  {device === "mobile" ? (
                    <RiSmartphoneLine className="size-5" />
                  ) : (
                    <RiComputerLine className="size-5" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {browser} on {os}
                    </p>
                    {isCurrent && <Badge variant="secondary">Current</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {session.ipAddress}
                    {" · "}
                    Expires {new Date(session.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled={isCurrent} onClick={() => revokeSession(session.token)}>
                Revoke
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
