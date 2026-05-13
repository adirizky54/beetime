import { valibotResolver } from "@hookform/resolvers/valibot";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@beetime/ui/components/avatar";
import { Badge } from "@beetime/ui/components/badge";
import { Button } from "@beetime/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@beetime/ui/components/field";
import { Input } from "@beetime/ui/components/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@beetime/ui/components/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@beetime/ui/components/select";
import { Spinner } from "@beetime/ui/components/spinner";
import { toastManager } from "@beetime/ui/components/toast";
import { UpdateOrganizationSchema, type UpdateOrganizationInput } from "@beetime/schema";

import { AppBody } from "@/components/layouts/app-body";
import { AppContent } from "@/components/layouts/app-content";
import { AppHeader } from "@/components/layouts/app-header";
import { DeleteOrganizationDialog } from "@/components/settings/delete-organization-dialog";
import { authQueries } from "@/queries/auth";
import { organizationQueries } from "@/queries/organization";
import { getInitials, toSlug } from "@/utils/string";

const DATE_FORMAT_OPTIONS = [
  { value: "hyphen-separated-yyyy-mm-dd", label: "YYYY-MM-DD" },
  { value: "hyphen-separated-mm-dd-yyyy", label: "MM-DD-YYYY" },
  { value: "hyphen-separated-dd-mm-yyyy", label: "DD-MM-YYYY" },
  { value: "slash-separated-mm-dd-yyyy", label: "MM/DD/YYYY" },
  { value: "slash-separated-dd-mm-yyyy", label: "DD/MM/YYYY" },
] as const;

const TIME_FORMAT_OPTIONS = [
  { value: "12-hours", label: "12-hour (1:30 PM)" },
  { value: "24-hours", label: "24-hour (13:30)" },
] as const;

const INTERVAL_FORMAT_OPTIONS = [
  { value: "hours-minutes", label: "1h 30m" },
  { value: "hours-minutes-colon-separated", label: "1:30" },
  { value: "hours-minutes-seconds-colon-separated", label: "1:30:00" },
] as const;

export const Route = createFileRoute("/$orgSlug/settings/")({
  beforeLoad: async ({ context }) => {
    const result = await context.queryClient.ensureQueryData(
      authQueries.hasPermission(context.organization.id, { organization: ["update"] }),
    );

    if (!result.data?.success) {
      throw redirect({ to: "/access-denied" });
    }
  },
  head: () => ({
    meta: [{ title: "Settings — Bee Time" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const slugManuallyEdited = useRef(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateOrganizationInput>({
    mode: "onChange",
    resolver: valibotResolver(UpdateOrganizationSchema),
    defaultValues: {
      name: organization.name,
      slug: organization.slug,
      dateFormat: organization.dateFormat,
      timeFormat: organization.timeFormat,
      intervalFormat: organization.intervalFormat,
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

  const { mutate: updateOrganization, isPending: isUpdatingOrganization } = useMutation({
    ...organizationQueries.update(organization.id),
    onSuccess: async (data) => {
      toastManager.add({ type: "success", title: "Organization updated" });
      await queryClient.invalidateQueries({ queryKey: organizationQueries.getKey(organization.id) });

      if (data && data.slug !== organization.slug) {
        await navigate({ to: "/$orgSlug/settings", params: { orgSlug: data.slug } });
      }
    },
    onError: (error) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Something went wrong. Please try again.";
      toastManager.add({ type: "error", title: message });
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    updateOrganization(values);
  });

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>, onChange: (v: string) => void) => {
    onChange(e.target.value);
    if (!slugManuallyEdited.current) {
      const slug = toSlug(e.target.value);
      form.setValue("slug", slug, { shouldValidate: true });
      setSlugAvailable(null);
      if (slug && slug !== organization.slug) {
        debouncedCheckSlug(slug);
      }
    }
  };

  const onChangeSlug = (e: React.ChangeEvent<HTMLInputElement>, onChange: (v: string) => void) => {
    slugManuallyEdited.current = true;
    const slug = toSlug(e.target.value);
    onChange(slug);
    setSlugAvailable(null);
    if (slug && slug !== organization.slug) {
      debouncedCheckSlug(slug);
    }
  };

  return (
    <AppContent>
      <AppHeader
        breadcrumbs={[{ to: "/$orgSlug/settings", params: { orgSlug: organization.slug }, title: "Settings" }]}
      />

      <AppBody>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <FieldSet>
                <FieldLegend>General</FieldLegend>
                <FieldDescription>Basic information about your organization.</FieldDescription>
                <FieldGroup>
                  <Controller
                    name="logo"
                    control={form.control}
                    render={({ field }) => (
                      <Field orientation="horizontal" className="items-center gap-4">
                        <Avatar className="size-16">
                          <AvatarImage src={field.value ?? undefined} alt={organization.name} />
                          <AvatarFallback className="text-lg">
                            {getInitials(form.watch("name") || organization.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                          <FieldLabel>Organization Logo</FieldLabel>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => logoInputRef.current?.click()}
                            >
                              Upload
                            </Button>
                            {field.value && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => field.onChange(null)}>
                                Remove
                              </Button>
                            )}
                          </div>
                          <FieldDescription>PNG, JPG or WEBP. Max 1MB.</FieldDescription>
                        </div>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) field.onChange(URL.createObjectURL(file));
                            e.target.value = "";
                          }}
                        />
                      </Field>
                    )}
                  />

                  <FieldSeparator />

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
                          onChange={(e) => onChangeName(e, field.onChange)}
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
                            <InputGroupText>{window.location.host}/</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            {...field}
                            id="org-slug"
                            placeholder="acme-inc"
                            aria-invalid={fieldState.invalid}
                            className="pl-0!"
                            onChange={(e) => onChangeSlug(e, field.onChange)}
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
                </FieldGroup>
              </FieldSet>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend>Date &amp; Time</FieldLegend>
                <FieldDescription>How dates, times, and durations are displayed.</FieldDescription>
                <FieldGroup>
                  <Controller
                    name="dateFormat"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="org-date-format">Date Format</FieldLabel>
                        <Select items={DATE_FORMAT_OPTIONS} value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="org-date-format" aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select date format" />
                          </SelectTrigger>
                          <SelectContent alignItemWithTrigger={false}>
                            <SelectGroup>
                              {DATE_FORMAT_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="timeFormat"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="org-time-format">Time Format</FieldLabel>
                        <Select items={TIME_FORMAT_OPTIONS} value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="org-time-format" aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select time format" />
                          </SelectTrigger>
                          <SelectContent alignItemWithTrigger={false}>
                            <SelectGroup>
                              {TIME_FORMAT_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="intervalFormat"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="org-interval-format">Duration Format</FieldLabel>
                        <Select items={INTERVAL_FORMAT_OPTIONS} value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="org-interval-format" aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select duration format" />
                          </SelectTrigger>
                          <SelectContent alignItemWithTrigger={false}>
                            <SelectGroup>
                              {INTERVAL_FORMAT_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>

              <Field orientation="horizontal" className="justify-end">
                <Button
                  type="submit"
                  disabled={
                    !form.formState.isDirty || !form.formState.isValid || isUpdatingOrganization || isCheckingSlug
                  }
                >
                  {isUpdatingOrganization && <Spinner data-icon="inline-start" />}
                  Save Changes
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <FieldSeparator />

          <FieldSet>
            <FieldLegend className="text-destructive">Danger Zone</FieldLegend>
            <FieldDescription>Irreversible actions for this organization.</FieldDescription>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">Delete Organization</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete <strong>{organization.name}</strong> and all its data. This cannot be undone.
                </p>
              </div>
              <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                Delete
              </Button>
            </div>
          </FieldSet>

          <DeleteOrganizationDialog
            orgId={organization.id}
            orgName={organization.name}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </div>
      </AppBody>
    </AppContent>
  );
}
