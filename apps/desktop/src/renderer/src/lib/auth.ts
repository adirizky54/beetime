import { createAuthClient } from "better-auth/client";
import { inferOrgAdditionalFields, organizationClient } from "better-auth/client/plugins";

export const auth = createAuthClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  basePath: "/api/v1/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    organizationClient({
      schema: inferOrgAdditionalFields({
        organization: {
          additionalFields: {
            dateFormat: {
              type: [
                "hyphen-separated-yyyy-mm-dd",
                "hyphen-separated-mm-dd-yyyy",
                "hyphen-separated-dd-mm-yyyy",
                "slash-separated-mm-dd-yyyy",
                "slash-separated-dd-mm-yyyy",
              ],
            },
            timeFormat: {
              type: ["12-hours", "24-hours"],
            },
            intervalFormat: {
              type: ["hours-minutes", "hours-minutes-colon-separated", "hours-minutes-seconds-colon-separated"],
            },
          },
        },
      }),
    }),
  ],
});

export type Session = (typeof auth.$Infer.Session)["session"];
export type User = (typeof auth.$Infer.Session)["user"];
export type Organization = typeof auth.$Infer.Organization;
export type OrgDateFormat = typeof auth.$Infer.Organization.dateFormat;
export type OrgTimeFormat = typeof auth.$Infer.Organization.timeFormat;
export type OrgIntervalFormat = typeof auth.$Infer.Organization.intervalFormat;
