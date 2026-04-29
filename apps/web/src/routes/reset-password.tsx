import { RiErrorWarningLine, RiLockPasswordLine, RiMailCheckLine } from "@remixicon/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as v from "valibot";

import { Button } from "@beetime/ui/components/button";
import { Card, CardContent } from "@beetime/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@beetime/ui/components/field";
import { Input } from "@beetime/ui/components/input";
import { Spinner } from "@beetime/ui/components/spinner";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Reset Password — Bee Time" }],
  }),
  validateSearch: v.object({
    token: v.optional(v.string()),
  }),
});

const formSchema = v.pipe(
  v.object({
    password: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty("Please enter your new password."),
      v.minLength(8, "Password must be at least 8 characters long."),
      v.regex(/[a-z]/, "Password must contain at least one lowercase letter"),
      v.regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
      v.regex(/[0-9]/, "Password must contain at least one number"),
      v.regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/, "Password must contain at least one special character"),
    ),
    confirm_password: v.pipe(v.string(), v.nonEmpty("Please confirm your password.")),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirm_password"]],
      (input) => input.password === input.confirm_password,
      "Passwords do not match.",
    ),
    ["confirm_password"],
  ),
);

type State = { status: "form" } | { status: "success" } | { status: "error"; message: string };

function RouteComponent() {
  const { token } = Route.useSearch();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<State>(
    token
      ? { status: "form" }
      : { status: "error", message: "No reset token found in the URL. Please check the link in your email." },
  );

  const form = useForm<v.InferInput<typeof formSchema>>({
    mode: "all",
    resolver: valibotResolver(formSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!token) return;

    await auth.resetPassword(
      {
        newPassword: values.password,
        token,
      },
      {
        onRequest: () => {
          form.clearErrors();
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          setState({ status: "success" });
        },
        onError: (err) => {
          setLoading(false);
          setState({ status: "error", message: err.error.message });
        },
      },
    );
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="p-6 md:p-8">
              <div aria-live="polite" aria-atomic="true">
                {state.status === "form" && (
                  <form onSubmit={onSubmit}>
                    <FieldGroup>
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                          <RiLockPasswordLine className="size-5 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">Set new password</h1>
                        <p className="text-balance text-muted-foreground">Choose a strong password for your account.</p>
                      </div>
                      <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="password">New password</FieldLabel>
                            <Input
                              {...field}
                              id="password"
                              type="password"
                              placeholder="Your new password"
                              autoComplete="new-password"
                              aria-invalid={fieldState.invalid}
                              required
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                      <Controller
                        name="confirm_password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="confirm_password">Confirm password</FieldLabel>
                            <Input
                              {...field}
                              id="confirm_password"
                              type="password"
                              placeholder="Confirm your new password"
                              autoComplete="new-password"
                              aria-invalid={fieldState.invalid}
                              required
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                      <Field>
                        <Button disabled={loading || !form.formState.isValid} type="submit">
                          {loading && <Spinner data-icon="inline-start" />}
                          Reset password
                        </Button>
                      </Field>
                    </FieldGroup>
                  </form>
                )}

                {state.status === "success" && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <RiMailCheckLine className="size-5 text-primary" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h1 className="text-2xl font-bold">Password reset</h1>
                      <p className="text-balance text-muted-foreground">
                        Your password has been updated. You can now sign in with your new password.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full" nativeButton={false} render={<Link to="/login" />}>
                      Sign in
                    </Button>
                  </div>
                )}

                {state.status === "error" && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                      <RiErrorWarningLine className="size-5 text-destructive" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h1 className="text-2xl font-bold">Reset failed</h1>
                      <p className="text-balance text-muted-foreground">{state.message}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      nativeButton={false}
                      render={<Link to="/forgot-password" />}
                    >
                      Request a new link
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
