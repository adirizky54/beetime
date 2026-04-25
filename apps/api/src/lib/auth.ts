import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, organization } from "better-auth/plugins";
import { nanoid } from "nanoid";

import { env } from "@/env";
import { db } from "./db";
import { getActiveOrganization } from "@/utils/access";
import { ac, admin, member, owner, superadmin, user } from "@/utils/permissions";
import { toSlug } from "@/utils/string";

export const auth = betterAuth({
  appName: env.APP_NAME,
  baseURL: env.APP_ORIGIN,
  basePath: "/api/v1/auth",
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: ["http://localhost:*"],
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  disabledPaths: ["/organization/list-members"],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    adminPlugin({
      defaultRole: "user",
      ac,
      roles: {
        superadmin,
        user,
      }
    }),
    organization({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
      organizationLimit: 2,
      schema: {
        organization: {
          additionalFields: {
            dateFormat: {
              type: "string",
              input: true,
              required: true,
            },
            timeFormat: {
              type: "string",
              input: true,
              required: true,
            },
            intervalFormat: {
              type: "string",
              input: true,
              required: true,
            }
          }
        }
      }
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await auth.api.createOrganization({
            body: {
              userId: user.id,
              name: `${user.name}'s Organization`,
              slug: toSlug(user.name, nanoid(9)),
              dateFormat: "hyphen-separated-yyyy-mm-dd",
              timeFormat: "24-hours",
              intervalFormat: "hours-minutes"
            },
          });
        },
      }
    },
    session: {
      create: {
        before: async (session) => {
          const activeOrganization = await getActiveOrganization(
            session.userId
          );

          return {
            data: {
              ...session,
              activeOrganizationId: activeOrganization?.id,
            },
          };
        }
      }
    }
  }
});

// Base session types from Better Auth - plugin-specific fields added at runtime
type SessionResponse = typeof auth.$Infer.Session;
export type AuthUser = SessionResponse["user"];
export type AuthSession = SessionResponse["session"];