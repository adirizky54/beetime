import { useRouteContext } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RiComputerLine, RiSmartphoneLine } from "@remixicon/react";

import { Button } from "@beetime/ui/components/button";
import { Badge } from "@beetime/ui/components/badge";
import { Spinner } from "@beetime/ui/components/spinner";
import { toastManager } from "@beetime/ui/components/toast";

import { profileQueries } from "@/queries/profile";
import { parseUserAgent } from "@/utils/user-agent";

export function SessionsTab() {
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