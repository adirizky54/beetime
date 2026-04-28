import { Controller, useForm, useWatch } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { UpdateProjectSchema, type Client, type Project, type UpdateProjectInput } from "@beetime/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@beetime/ui/components/avatar";
import { Button } from "@beetime/ui/components/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@beetime/ui/components/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@beetime/ui/components/dialog";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@beetime/ui/components/field";
import { Input } from "@beetime/ui/components/input";
import { RadioGroup, RadioGroupItem } from "@beetime/ui/components/radio-group";
import { Spinner } from "@beetime/ui/components/spinner";
import { Textarea } from "@beetime/ui/components/textarea";
import { toastManager } from "@beetime/ui/components/toast";

import { getInitials } from "@/utils/string";
import { clientQueries } from "@/queries/client";
import { memberQueries } from "@/queries/member";
import { projectQueries } from "@/queries/project";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export function EditProjectDialog({ open, onOpenChange, project }: EditProjectDialogProps) {
  const queryClient = useQueryClient();
  const anchor = useComboboxAnchor();

  const form = useForm<UpdateProjectInput>({
    mode: "all",
    resolver: valibotResolver(UpdateProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      clientId: project.clientId,
      privacy: project.privacy,
      userIds: project.privacy === "private" ? project.members.map((m) => m.id) : [],
    },
  });
  const privacy = useWatch({ control: form.control, name: "privacy" });

  const { data: members } = useQuery({
    ...memberQueries.listAll(project.organizationId),
    enabled: open,
  });
  const orgMembers = members?.data ?? [];

  const { data: clientsResponse } = useQuery({
    ...clientQueries.listAll(project.organizationId, { status: "active" }),
    enabled: open,
  });
  const clients = clientsResponse?.data ?? [];

  const updateProject = useMutation({
    ...projectQueries.update(project.organizationId, project.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueries.listKey() });
      toastManager.add({ type: "success", title: "Project updated" });
      handleOpenChange(false);
    },
    onError: (error) => {
      if (typeof error.data === "object") {
        if (error.response.status === 400) {
          const errors = error.data.errors;
          for (const key in errors) {
            form.setError(key as keyof UpdateProjectInput, {
              type: "manual",
              message: errors[key][0],
            });
          }
        } else {
          toastManager.add({ type: "error", title: error.data.message });
        }
      } else {
        toastManager.add({ type: "error", title: "Something went wrong. Please try again." });
      }
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      updateProject.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors();
    updateProject.mutate(values);
  });

  const getClient = (clientId: string | null) => {
    return clients.find((c) => c.id === clientId);
  };

  const getMembers = (userIds: Array<string>) => {
    return orgMembers.filter((m) => userIds.includes(m.id));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update the details of your project.</DialogDescription>
        </DialogHeader>

        <form id="edit-project-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-project-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="edit-project-name"
                    placeholder="e.g. Website Redesign"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-project-description">
                    Description
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    id="edit-project-description"
                    placeholder="What is this project about?"
                    rows={3}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="clientId"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="edit-project-client">
                    Client
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Combobox
                    id="edit-project-client"
                    name={field.name}
                    inputRef={field.ref}
                    items={clients}
                    itemToStringLabel={(item: Client) => item.name}
                    itemToStringValue={(item: Client) => item.id}
                    value={getClient(field.value)}
                    onValueChange={(item) => field.onChange(item?.id)}
                  >
                    <ComboboxInput placeholder="Select client..." showClear onBlur={field.onBlur} />
                    <ComboboxContent>
                      <ComboboxEmpty>No client found.</ComboboxEmpty>
                      <ComboboxList>
                        {(item: Client) => (
                          <ComboboxItem key={item.id} value={item}>
                            {item.name}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>
              )}
            />

            <Controller
              name="privacy"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet>
                  <FieldLegend variant="label">Privacy</FieldLegend>
                  <RadioGroup
                    className="flex flex-row"
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("userIds", []);
                    }}
                  >
                    <FieldLabel className="font-normal">
                      <RadioGroupItem value="public" aria-invalid={fieldState.invalid} />
                      Public
                    </FieldLabel>
                    <FieldLabel className="font-normal">
                      <RadioGroupItem value="private" aria-invalid={fieldState.invalid} />
                      Private
                    </FieldLabel>
                  </RadioGroup>
                </FieldSet>
              )}
            />

            {privacy === "private" && (
              <Controller
                name="userIds"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="project-members">Members</FieldLabel>
                    <Combobox
                      multiple
                      id="project-members"
                      name={field.name}
                      items={orgMembers}
                      value={getMembers(field.value)}
                      onValueChange={(items) => field.onChange(items.map((m) => m.id))}
                      itemToStringLabel={(item) => item.name}
                      itemToStringValue={(item) => item.id}
                    >
                      <ComboboxChips ref={anchor}>
                        <ComboboxValue>
                          {(values: Array<(typeof orgMembers)[number]>) => (
                            <>
                              {values.map((value) => (
                                <ComboboxChip key={value.id}>{value.name}</ComboboxChip>
                              ))}
                              <ComboboxChipsInput
                                ref={field.ref}
                                placeholder="Select members..."
                                aria-invalid={fieldState.invalid}
                                onBlur={field.onBlur}
                              />
                            </>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>

                      <ComboboxContent anchor={anchor}>
                        <ComboboxEmpty>No member found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: (typeof orgMembers)[number]) => (
                            <ComboboxItem key={item.id} value={item}>
                              <Avatar size="sm">
                                <AvatarImage src={item.image ?? undefined} alt={item.name} />
                                <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
                              </Avatar>
                              {item.name}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            )}
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="edit-project-form"
            disabled={updateProject.isPending || !form.formState.isValid || !form.formState.isDirty}
          >
            {updateProject.isPending && <Spinner data-icon="inline-start" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
