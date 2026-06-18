import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, organization } from "better-auth/plugins";
import { nanoid } from "nanoid";
import { env } from "@/env";

import { db } from "./db";
import { sendVerificationEmail, sendResetPasswordEmail, sendInvitationEmail } from "./mailer";
import { getActiveOrganization } from "@/utils/access";
import { ac, admin, member, owner, superadmin, user } from "@/utils/permissions";
import { toSlug } from "@/utils/string";

export const auth = betterAuth({
  appName: env.APP_NAME,
  baseURL: env.API_ORIGIN,
  basePath: "/api/v1/auth",
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: ["http://localhost:*"],
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  user: {
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
    },
  },
  disabledPaths: ["/organization/list-members"],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, token }) => {
      await sendResetPasswordEmail(env, {
        user: {
          name: user.name,
          email: user.email,
        },
        url: `${env.APP_ORIGIN}/reset-password?token=${token}`,
      });
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
  },
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 3600 * 24 * 1, // 1 day
    sendVerificationEmail: async ({ user, token }) => {
      await sendVerificationEmail(env, {
        user: {
          name: user.name,
          email: user.email,
        },
        url: `${env.APP_ORIGIN}/verify-email?token=${token}`,
      });
    },
  },
  plugins: [
    adminPlugin({
      defaultRole: "user",
      ac,
      roles: {
        superadmin,
        user,
      },
    }),
    organization({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
      organizationLimit: 2,
      sendInvitationEmail: async ({ invitation, inviter, organization }) => {
        await sendInvitationEmail(env, {
          invitation,
          inviter,
          organization,
        });
      },
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
            },
          },
        },
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.role === "user") {
            await auth.api.createOrganization({
              body: {
                userId: user.id,
                name: `${user.name}'s Organization`,
                slug: toSlug(user.name, nanoid(9)),
                dateFormat: "hyphen-separated-yyyy-mm-dd",
                timeFormat: "24-hours",
                intervalFormat: "hours-minutes",
              },
            });
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const activeOrganization = await getActiveOrganization(session.userId);

          return {
            data: {
              ...session,
              activeOrganizationId: activeOrganization?.id,
            },
          };
        },
      },
    },
  },
});

// Base session types from Better Auth - plugin-specific fields added at runtime
type SessionResponse = typeof auth.$Infer.Session;
export type AuthUser = SessionResponse["user"];
export type AuthSession = SessionResponse["session"];
