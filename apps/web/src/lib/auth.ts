import { createAuthClient } from "better-auth/react";
import { adminClient, inferOrgAdditionalFields, organizationClient } from "better-auth/client/plugins";

import { ac, admin, member, owner, superadmin, user } from "@/utils/permissions";

export const auth = createAuthClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  basePath: "/api/v1/auth",
  plugins: [
    adminClient({
      ac,
      roles: {
        superadmin,
        user,
      },
    }),
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
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

export type Session = typeof auth.$Infer.Session;

export type OrgDateFormat = typeof auth.$Infer.Organization.dateFormat;
export type OrgTimeFormat = typeof auth.$Infer.Organization.timeFormat;
export type OrgIntervalFormat = typeof auth.$Infer.Organization.intervalFormat;
export type Invitation = typeof auth.$Infer.Invitation;
