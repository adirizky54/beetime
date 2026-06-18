import { valibotResolver } from "@hookform/resolvers/valibot";
import { createFileRoute, redirect, useCanGoBack, useRouter } from "@tanstack/react-router";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as v from "valibot";

import { Badge } from "@beetime/ui/components/badge";
import { Button } from "@beetime/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@beetime/ui/components/field";
import { Input } from "@beetime/ui/components/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@beetime/ui/components/input-group";
import { Spinner } from "@beetime/ui/components/spinner";
import { CreateOrganizationSchema } from "@beetime/schema";
import { toast } from "@beetime/ui/components/sonner";

import { auth } from "@/lib/auth";
import { organizationQueries } from "@/queries/organization";
import { toSlug } from "@/utils/string";
import { MinimalLayout } from "@/components/layouts/minimal-layout";

export const Route = createFileRoute("/create-organization")({
  head: () => ({
    meta: [{ title: "Create Organization — Bee Time" }],
  }),
  beforeLoad: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
});

const formSchema = v.pick(CreateOrganizationSchema, ["name", "slug"]);
type FormValues = v.InferInput<typeof formSchema>;

function RouteComponent() {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const canGoBack = useCanGoBack();
  const { data: organizations } = auth.useListOrganizations();

  const slugManuallyEdited = useRef(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const form = useForm<FormValues>({
    mode: "onChange",
    resolver: valibotResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const { mutate: checkSlug, isPending: isCheckingSlug } = useMutation({
    ...organizationQueries.checkSlug(),
    onSuccess: () => {
      setSlugAvailable(true);
      form.clearErrors("slug");
    },
    onError: () => {
      setSlugAvailable(false);
      form.setError("slug", { type: "value", message: "This slug is already taken" });
    },
  });

  const debouncedCheckSlug = useDebouncedCallback((slug: string) => checkSlug(slug), { wait: 300 });

  const { mutate: createOrganization, isPending: isCreatingOrganization } = useMutation({
    ...organizationQueries.create(),
    onSuccess: (data) => {
      toast.success("Organization created");
      void navigate({ to: "/$orgSlug", params: { orgSlug: data.slug } });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : undefined;
      toast.error(message || "Failed to create organization. Please try again.");
    },
  });

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("name", e.target.value, { shouldValidate: true });
    if (!slugManuallyEdited.current) {
      const slug = toSlug(e.target.value);
      form.setValue("slug", slug, { shouldValidate: true });
      if (slug) {
        debouncedCheckSlug(slug);
      } else {
        setSlugAvailable(null);
      }
    }
  };

  const onChangeSlug = (e: React.ChangeEvent<HTMLInputElement>) => {
    slugManuallyEdited.current = true;
    const slug = toSlug(e.target.value);
    form.setValue("slug", slug);
    setSlugAvailable(null);
    if (slug) {
      debouncedCheckSlug(slug);
    } else {
      setSlugAvailable(null);
    }
  };

  const onBack = () => {
    if (canGoBack) {
      router.history.back();
    } else {
      navigate({ to: "/" });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    createOrganization({
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
                    autoComplete="off"
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
                      className="pl-0!"
                      onChange={onChangeSlug}
                    />
                    <InputGroupAddon align="inline-end">
                      {isCheckingSlug ? (
                        <Spinner />
                      ) : slugAvailable !== null ? (
                        <Badge variant={slugAvailable ? "success" : "error"}>
                          {slugAvailable ? "Available" : "Taken"}
                        </Badge>
                      ) : null}
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Field orientation="horizontal" className="justify-end">
              {hasOrganizations && (
                <Button type="button" variant="outline" onClick={onBack}>
                  Go Back
                </Button>
              )}

              <Button type="submit" disabled={!form.formState.isValid || isCreatingOrganization || isCheckingSlug}>
                {isCreatingOrganization && <Spinner data-icon="inline-start" />}
                Create Organization
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </MinimalLayout>
  );
}
