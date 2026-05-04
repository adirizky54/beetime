import { RiBuildingLine, RiErrorWarningLine } from "@remixicon/react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import * as v from "valibot";

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
import { Button } from "@beetime/ui/components/button";
import { Skeleton } from "@beetime/ui/components/skeleton";
import { Spinner } from "@beetime/ui/components/spinner";
import { toastManager } from "@beetime/ui/components/toast";

import { MinimalLayout } from "@/components/layouts/minimal-layout";
import { auth } from "@/lib/auth";
import { invitationQueries } from "@/queries/invitation";
import { toTitleCase } from "@/utils/string";

function normalizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "This invitation is invalid or has expired.";
  const msg = error.message.toLowerCase();
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("connection")) {
    return "Unable to reach the server. Check your connection and try again.";
  }
  return error.message;
}

export const Route = createFileRoute("/organization-invitations")({
  head: () => ({
    meta: [{ title: "Invitation — Bee Time" }],
  }),
  validateSearch: v.object({
    token: v.optional(v.string()),
  }),
  beforeLoad: async ({ location }) => {
    const session = await auth.getSession();
    if (!session.data) {
      throw redirect({
        to: "/login",
        search: { redirectTo: location.href },
      });
    }
  },
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: async ({ context, deps }) => {
    if (!deps.token) return;
    await context.queryClient.ensureQueryData(invitationQueries.get(deps.token));
  },
  pendingComponent: InvitationSkeleton,
  errorComponent: InvitationError,
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useSearch();

  if (!token) {
    return (
      <MinimalLayout>
        <div className="w-full max-w-md">
          <InvitationErrorCard message="No invitation token found in the URL. Please check the link in your email." />
        </div>
      </MinimalLayout>
    );
  }

  return (
    <MinimalLayout>
      <div className="w-full max-w-md">
        <InvitationDetails token={token} />
      </div>
    </MinimalLayout>
  );
}

function InvitationDetails({ token }: { token: string }) {
  const navigate = useNavigate();
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);

  const { data } = useSuspenseQuery(invitationQueries.get(token));

  const accept = useMutation({
    ...invitationQueries.accept(),
    onSuccess: (result) => {
      navigate({ to: "/$orgId", params: { orgId: result.invitation.organizationId } });
    },
    onError: (err) => {
      toastManager.add({ type: "error", title: err.message || "Failed to accept invitation." });
    },
  });

  const reject = useMutation({
    ...invitationQueries.reject(),
    onSuccess: () => {
      navigate({ to: "/" });
    },
    onError: (err) => {
      toastManager.add({ type: "error", title: err.message || "Failed to decline invitation." });
      setShowDeclineDialog(false);
    },
  });

  const isBusy = accept.isPending || reject.isPending;

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <RiBuildingLine className="size-6 text-primary" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">You've been invited to join</p>
          <h1 className="text-2xl font-bold break-words">{data.organizationName}</h1>
        </div>
      </div>

      <div className="my-6 h-px bg-border" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Invited by</span>
          <span className="min-w-0 truncate text-sm font-medium">{data.inviterEmail}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Role</span>
          <span className="text-sm font-medium">{toTitleCase(data.role)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Expires</span>
          <span className="text-sm font-medium">{format(new Date(data.expiresAt), "d MMM yyyy")}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Button disabled={isBusy} onClick={() => accept.mutate({ invitationId: data.id })}>
          {accept.isPending && <Spinner data-icon="inline-start" />}
          Accept invitation
        </Button>
        <Button variant="outline" disabled={isBusy} onClick={() => setShowDeclineDialog(true)}>
          {reject.isPending && <Spinner data-icon="inline-start" />}
          Decline
        </Button>
      </div>

      <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              You will not be able to join <strong>{data.organizationName}</strong> using this invitation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reject.isPending}>Keep</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={reject.isPending}
              onClick={() => reject.mutate({ invitationId: data.id })}
            >
              {reject.isPending && <Spinner data-icon="inline-start" />}
              Decline invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function InvitationErrorCard({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10">
        <RiErrorWarningLine className="size-6 text-destructive" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Invalid invitation</h1>
        <p className="text-sm text-balance text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" className="w-full" nativeButton={false} render={<Link to="/" />}>
        Go home
      </Button>
    </div>
  );
}

function InvitationError({ error }: ErrorComponentProps) {
  return (
    <MinimalLayout>
      <div className="w-full max-w-md">
        <InvitationErrorCard message={normalizeErrorMessage(error)} />
      </div>
    </MinimalLayout>
  );
}

function InvitationSkeleton() {
  return (
    <MinimalLayout>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-12 rounded-xl" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-44" />
        </div>

        <div className="my-6 h-px bg-muted" />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>
    </MinimalLayout>
  );
}
