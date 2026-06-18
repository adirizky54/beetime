import { Controller, useForm, useWatch } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CreateProjectSchema, type Client, type CreateProjectInput, type Member } from "@beetime/schema";
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
import { toast } from "@beetime/ui/components/sonner";

import { getInitials } from "@/utils/string";
import { clientQueries } from "@/queries/client";
import { memberQueries } from "@/queries/member";
import { projectQueries } from "@/queries/project";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}

export function CreateProjectDialog({ open, onOpenChange, orgId }: CreateProjectDialogProps) {
  const queryClient = useQueryClient();
  const anchor = useComboboxAnchor();

  const form = useForm<CreateProjectInput>({
    mode: "onChange",
    resolver: valibotResolver(CreateProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      clientId: null,
      privacy: "public",
      userIds: [],
    },
  });
  const privacy = useWatch({ control: form.control, name: "privacy" });

  const { data: members } = useQuery({
    ...memberQueries.listAll(orgId),
    enabled: open,
  });
  const orgMembers = members?.data ?? [];

  const { data: clientsResponse } = useQuery({
    ...clientQueries.listAll(orgId, { status: "active" }),
    enabled: open,
  });
  const clients = clientsResponse?.data ?? [];

  const {
    mutate: createProject,
    isPending: isCreatingProject,
    reset: resetCreateProject,
  } = useMutation({
    ...projectQueries.create(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueries.listKey() });
      toast.success("Project created");
      handleOpenChange(false);
    },
    onError: (error) => {
      if (typeof error.data === "object") {
        if (error.response.status === 400) {
          const errors = error.data.errors;
          for (const key in errors) {
            form.setError(key as keyof CreateProjectInput, {
              type: "manual",
              message: errors[key][0],
            });
          }
        } else {
          toast.error(error.data.message);
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      resetCreateProject();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors();
    createProject(values);
  });

  const getClient = (clientId: string | null) => {
    return clients.find((c) => c.id === clientId);
  };

  const getMembers = (userIds: Array<string>) => {
    return orgMembers.filter((m) => userIds.includes(m.userId));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>Add a new project to your workspace.</DialogDescription>
        </DialogHeader>

        <form id="create-project-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-project-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="create-project-name"
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
                  <FieldLabel htmlFor="create-project-description">
                    Description
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    id="create-project-description"
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
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-project-client">
                    Client
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Combobox
                    id="create-project-client"
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
                      onValueChange={(items) => field.onChange(items.map((m) => m.userId))}
                      itemToStringLabel={(item) => item.name}
                      itemToStringValue={(item) => item.userId}
                    >
                      <ComboboxChips ref={anchor}>
                        <ComboboxValue>
                          {(values: Member[]) => (
                            <>
                              {values.map((value) => (
                                <ComboboxChip key={value.userId}>{value.name}</ComboboxChip>
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
                          {(item: Member) => (
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
          <Button type="submit" form="create-project-form" disabled={isCreatingProject || !form.formState.isValid}>
            {isCreatingProject && <Spinner data-icon="inline-start" />}
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
