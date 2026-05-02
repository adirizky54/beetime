import { Link, createFileRoute } from "@tanstack/react-router";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as v from "valibot";
import { RiMailSendLine } from "@remixicon/react";

import { Button } from "@beetime/ui/components/button";
import { Card, CardContent } from "@beetime/ui/components/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@beetime/ui/components/field";
import { Input } from "@beetime/ui/components/input";
import { Spinner } from "@beetime/ui/components/spinner";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Forgot Password — Bee Time" }],
  }),
});

const formSchema = v.object({
  email: v.pipe(v.string(), v.nonEmpty("Please enter your email."), v.email("Please enter a valid email address.")),
});

function RouteComponent() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<v.InferInput<typeof formSchema>>({
    mode: "all",
    resolver: valibotResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await auth.requestPasswordReset(
      {
        email: values.email,
        redirectTo: "/reset-password",
      },
      {
        onRequest: () => {
          form.clearErrors();
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          setSent(true);
        },
        onError: () => {
          // Always show success to prevent email enumeration
          setLoading(false);
          setSent(true);
        },
      },
    );
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-6 md:p-8">
            <div aria-live="polite" aria-atomic="true">
              {sent ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <RiMailSendLine className="size-5 text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">Check your inbox</h1>
                    <p className="text-balance text-muted-foreground">
                      If that email is registered, you&apos;ll receive a reset link shortly.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full" nativeButton={false} render={<Link to="/login" />}>
                    Back to sign in
                  </Button>
                  <FieldDescription className="text-center">
                    <button
                      type="button"
                      className="underline underline-offset-4 hover:text-primary"
                      onClick={() => {
                        setSent(false);
                        form.reset();
                      }}
                    >
                      Try a different email address
                    </button>
                  </FieldDescription>
                </div>
              ) : (
                <form onSubmit={onSubmit}>
                  <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <h1 className="text-2xl font-bold">Forgot password?</h1>
                      <p className="text-balance text-muted-foreground">
                        Enter your email address and we'll send you a link to reset your password
                      </p>
                    </div>
                    <Controller
                      name="email"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="email">Email</FieldLabel>
                          <Input
                            {...field}
                            id="email"
                            type="email"
                            placeholder="name@mail.com"
                            autoComplete="email"
                            autoFocus
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
                        Send reset link
                      </Button>
                    </Field>
                    <FieldDescription className="text-center">
                      Remember your password? <Link to="/login">Sign in</Link>
                    </FieldDescription>
                  </FieldGroup>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
