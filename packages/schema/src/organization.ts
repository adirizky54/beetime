import * as v from "valibot";

export const CreateOrganizationSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Organization name cannot be empty")),
  slug: v.pipe(v.string(), v.nonEmpty("Organization slug cannot be empty")),
  logo: v.optional(v.string()),
  metadata: v.optional(v.record(v.string(), v.any())),
  keepCurrentActiveOrganization: v.optional(v.boolean()),
  dateFormat: v.picklist([
    "hyphen-separated-yyyy-mm-dd",
    "hyphen-separated-mm-dd-yyyy",
    "hyphen-separated-dd-mm-yyyy",
    "slash-separated-mm-dd-yyyy",
    "slash-separated-dd-mm-yyyy",
  ]),
  timeFormat: v.picklist(["12-hours", "24-hours"]),
  intervalFormat: v.picklist([
    "hours-minutes",
    "hours-minutes-colon-separated",
    "hours-minutes-seconds-colon-separated",
  ]),
});

export const UpdateOrganizationSchema = v.omit(CreateOrganizationSchema, ["keepCurrentActiveOrganization"]);

export type CreateOrganizationInput = v.InferOutput<typeof CreateOrganizationSchema>;
export type UpdateOrganizationInput = v.InferOutput<typeof UpdateOrganizationSchema>;
