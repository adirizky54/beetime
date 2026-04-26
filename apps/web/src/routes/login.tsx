import { Link, createFileRoute } from "@tanstack/react-router"
import { valibotResolver } from "@hookform/resolvers/valibot"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import * as v from "valibot"

import { Button } from "@beetime/ui/components/button"
import { Card, CardContent } from "@beetime/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@beetime/ui/components/field"
import { Input } from "@beetime/ui/components/input"
import { Spinner } from "@beetime/ui/components/spinner"
import { auth } from "@/lib/auth"

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Login — Bee Time" }]
  })
})

const formSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your email."),
    v.email(),
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your password."),
  ),
});

function RouteComponent() {
  const [loading, setLoading] = useState(false);

  const form = useForm<v.InferInput<typeof formSchema>>({
    mode: "all",
    resolver: valibotResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await auth.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: "/"
    }, {
      onRequest: () => {
        form.clearErrors();
        setLoading(true);
      },
      onSuccess: () => {
        setLoading(false);
      },
      onError: (err) => {
        setLoading(false);
        form.setError("email", { message: err.error.message });
      }
    });
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
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-balance text-muted-foreground">
                      Login to your Bee Time account
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
                          aria-invalid={fieldState.invalid}
                          required
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <div className="flex items-center">
                          <FieldLabel htmlFor="password">Password</FieldLabel>
                          <Link
                            to="/forgot-password"
                            className="ml-auto text-sm underline-offset-2 hover:underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          placeholder="Your password"
                          autoComplete="current-password"
                          aria-invalid={fieldState.invalid}
                          required
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Field>
                    <Button disabled={loading || !form.formState.isValid} type="submit">
                      {loading && <Spinner data-icon="inline-start" />}
                      Login
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
                      <span>Login with Google</span>
                    </Button>
                  </Field>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <Link to="/sign-up">Sign up</Link>
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
            By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
            and <a href="#">Privacy Policy</a>.
          </FieldDescription>
        </div>
      </div>
    </div>
  );
}
