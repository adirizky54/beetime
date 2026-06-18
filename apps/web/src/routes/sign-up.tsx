import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as v from "valibot";

import { Button } from "@beetime/ui/components/button";
import { Card, CardContent } from "@beetime/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@beetime/ui/components/field";
import { Input } from "@beetime/ui/components/input";
import { Spinner } from "@beetime/ui/components/spinner";
import { auth } from "@/lib/auth";

const formSchema = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.nonEmpty("Please enter your name.")),
    email: v.pipe(v.string(), v.nonEmpty("Please enter your email."), v.email()),
    password: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty("Please enter your password."),
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

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [{ title: "Sign Up — Bee Time" }],
  }),
  validateSearch: v.object({
    redirectTo: v.optional(v.string()),
  }),
  beforeLoad: async ({ context }) => {
    if (context.session) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { redirectTo } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<v.InferInput<typeof formSchema>>({
    mode: "all",
    resolver: valibotResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await auth.signUp.email(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: redirectTo ?? "/",
      },
      {
        onRequest: () => {
          form.clearErrors();
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          navigate({
            to: "/",
          });
        },
        onError: (err) => {
          const pattern = /\[body\.(\w+)\]\s([^;]+)/g;
          let match;
          let hasMatch = false;

          setLoading(false);

          while ((match = pattern.exec(err.error.message)) !== null) {
            const field = match[1] as keyof v.InferInput<typeof formSchema>;
            form.setError(field, { message: match[2].trim() });
            hasMatch = true;
          }
          if (!hasMatch) {
            form.setError("name", { message: err.error.message });
          }
        },
      },
    );
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form className="p-6 md:p-8" onSubmit={onSubmit}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="text-balance text-muted-foreground">
                      Enter your details below to create your account
                    </p>
                  </div>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="name">Full Name</FieldLabel>
                        <Input
                          {...field}
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          autoComplete="name"
                          aria-invalid={fieldState.invalid}
                          required
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
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="name@mail.com"
                          autoComplete="email"
                          aria-invalid={fieldState.invalid}
                          required
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Field>
                    <Field className="grid grid-cols-2 gap-4">
                      <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input
                              {...field}
                              id="password"
                              type="password"
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
                            <FieldLabel htmlFor="confirm_password">Confirm Password</FieldLabel>
                            <Input
                              {...field}
                              id="confirm_password"
                              type="password"
                              autoComplete="new-password"
                              aria-invalid={fieldState.invalid}
                              required
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                    </Field>
                  </Field>
                  <Field>
                    <Button disabled={loading || !form.formState.isValid} type="submit">
                      {loading && <Spinner data-icon="inline-start" />}
                      Create Account
                    </Button>
                  </Field>
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Or continue with
                  </FieldSeparator>
                  <Field className="grid grid-cols-1 gap-4">
                    <Button variant="outline" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </Button>
                  </Field>
                  <FieldDescription className="text-center">
                    Already have an account?{" "}
                    <Link to="/login" search={{ redirectTo }}>
                      Sign in
                    </Link>
                  </FieldDescription>
                </FieldGroup>
              </form>
              <div className="relative hidden bg-muted md:block">
                <img
                  src="https://ui.shadcn.com/placeholder.svg"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </FieldDescription>
        </div>
      </div>
    </div>
  );
}
