import { valibotResolver } from "@hookform/resolvers/valibot";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import * as v from "valibot";

import { Button } from "@beetime/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@beetime/ui/components/field";
import { Input } from "@beetime/ui/components/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@beetime/ui/components/input-group";
import { Spinner } from "@beetime/ui/components/spinner";
import { CreateOrganizationSchema } from "@beetime/schema";

import { auth } from "@/lib/auth";
import { organizationQueries } from "@/queries/organization";
import { toSlug } from "@/utils/string";
import { MinimalLayout } from "@/components/layouts/minimal-layout";

export const Route = createFileRoute("/create-organization")({
  head: () => ({
    meta: [{ title: "Create Organization — Bee Time" }],
  }),
  component: RouteComponent,
});

const formSchema = v.pick(CreateOrganizationSchema, ["name", "slug"]);
type FormValues = v.InferInput<typeof formSchema>;

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { data: organizations } = auth.useListOrganizations();

  const slugManuallyEdited = useRef(false);

  const form = useForm<FormValues>({
    mode: "all",
    resolver: valibotResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const mutation = useMutation({
    ...organizationQueries.create(),
    onSuccess: (data) => {
      void navigate({ to: "/$orgSlug", params: { orgSlug: data.slug } });
    },
  });

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("name", e.target.value, { shouldValidate: true });
    if (!slugManuallyEdited.current) {
      form.setValue("slug", toSlug(e.target.value), { shouldValidate: true });
    }
  };

  const onChangeSlug = (e: React.ChangeEvent<HTMLInputElement>) => {
    slugManuallyEdited.current = true;
    form.setValue("slug", toSlug(e.target.value));
  };

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      name: values.name,
      slug: values.slug,
      dateFormat: "hyphen-separated-yyyy-mm-dd",
      timeFormat: "24-hours",
      intervalFormat: "hours-minutes",
    });
  });

  const hasOrganizations = Array.isArray(organizations) && organizations.length > 0;

  return (
    <MinimalLayout>
      <div className="w-full max-w-md">
        <h3 className="text-2xl font-semibold text-balance text-foreground">Create Organization</h3>
        <p className="mt-1 text-sm text-pretty text-muted-foreground dark:text-muted-foreground">
          Set up a new organization to start tracking time.
        </p>

        <form className="mt-8" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="org-name">Organization Name</FieldLabel>
                  <Input
                    {...field}
                    id="org-name"
                    placeholder="Acme Inc."
                    aria-invalid={fieldState.invalid}
                    autoFocus
                    onChange={onChangeName}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="org-slug">Organization Slug</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon className="pl-2.5">
                      <InputGroupText>localhost:3000/</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="org-slug"
                      placeholder="acme-inc"
                      aria-invalid={fieldState.invalid}
                      className="pl-0.5!"
                      onChange={onChangeSlug}
                    />
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Field orientation="horizontal" className="justify-end">
              {hasOrganizations && (
                <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
                  Go Back
                </Button>
              )}

              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Spinner data-icon="inline-start" />}
                Create Organization
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </MinimalLayout>
  );
}
