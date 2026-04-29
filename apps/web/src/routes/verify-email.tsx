import { RiErrorWarningLine, RiMailCheckLine } from "@remixicon/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import * as v from "valibot";

import { Button } from "@beetime/ui/components/button";
import { Card, CardContent } from "@beetime/ui/components/card";
import { Spinner } from "@beetime/ui/components/spinner";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/verify-email")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Verify Email — Bee Time" }],
  }),
  validateSearch: v.object({
    token: v.optional(v.string()),
  }),
});

type State = { status: "loading" } | { status: "success" } | { status: "error"; message: string };

function RouteComponent() {
  const { token } = Route.useSearch();

  const [state, setState] = useState<State>(
    token
      ? { status: "loading" }
      : { status: "error", message: "No verification token found in the URL. Please check the link in your email." },
  );

  useEffect(() => {
    if (!token) return;

    auth.verifyEmail(
      { query: { token } },
      {
        onSuccess: () => {
          setState({ status: "success" });
        },
        onError: (err) => {
          setState({ status: "error", message: err.error.message });
        },
      },
    );
  }, [token]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="p-6 md:p-8">
              <div aria-live="polite" aria-atomic="true">
                {state.status === "loading" && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <Spinner className="size-8" />
                    <div className="flex flex-col gap-2">
                      <h1 className="text-2xl font-bold">Verifying your email</h1>
                      <p className="text-balance text-muted-foreground">Hang tight, this only takes a moment.</p>
                    </div>
                  </div>
                )}

                {state.status === "success" && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <RiMailCheckLine className="size-5 text-primary" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h1 className="text-2xl font-bold">Email verified</h1>
                      <p className="text-balance text-muted-foreground">
                        Your email is confirmed. You're ready to sign in.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full" nativeButton={false} render={<Link to="/login" />}>
                      Sign In
                    </Button>
                  </div>
                )}

                {state.status === "error" && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                      <RiErrorWarningLine className="size-5 text-destructive" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h1 className="text-2xl font-bold">Verification failed</h1>
                      <p className="text-balance text-muted-foreground">{state.message}</p>
                    </div>
                    <Button variant="outline" className="w-full" nativeButton={false} render={<Link to="/login" />}>
                      Back to sign in
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
