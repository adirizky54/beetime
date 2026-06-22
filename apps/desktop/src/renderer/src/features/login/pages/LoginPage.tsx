import { useNavigate } from "@tanstack/react-router";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { RiTimerFlashLine } from "@remixicon/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as v from "valibot";

import { Button } from "@beetime/ui/components/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@beetime/ui/components/field";
import { Input } from "@beetime/ui/components/input";
import { Spinner } from "@beetime/ui/components/spinner";
import { auth } from "@/lib/auth";

const formSchema = v.object({
  email: v.pipe(v.string(), v.nonEmpty("Please enter your email."), v.email()),
  password: v.pipe(v.string(), v.nonEmpty("Please enter your password.")),
});

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<v.InferInput<typeof formSchema>>({
    mode: "onSubmit",
    resolver: valibotResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await auth.signIn.email(
      {
        email: values.email,
        password: values.password,
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
          setLoading(false);
          form.setError("email", { message: err.error.message });
        },
      },
    );
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex size-10 items-center justify-center rounded-md">
                <RiTimerFlashLine className="size-10" />
              </div>
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <FieldDescription>Login to your Bee Time account</FieldDescription>
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
                    aria-invalid={fieldState.invalid}
                    required
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

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
                    placeholder="Your password"
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
                Login
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
