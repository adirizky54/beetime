import { mutationOptions, queryOptions } from "@tanstack/react-query";

import { auth } from "@/lib/auth";

export const profileQueries = {
  all: () => ["profile"] as const,
  sessionsKey: () => [...profileQueries.all(), "sessions"] as const,
  sessions: () =>
    queryOptions({
      queryKey: profileQueries.sessionsKey(),
      queryFn: async () => {
        const { data, error } = await auth.listSessions();
        if (error) throw error;
        return data;
      },
    }),
  updateProfileKey: () => [...profileQueries.all(), "update-profile"] as const,
  updateProfile: () =>
    mutationOptions({
      mutationKey: profileQueries.updateProfileKey(),
      mutationFn: async (payload: { name: string; image?: string | null }) => {
        const { data, error } = await auth.updateUser({ name: payload.name, image: payload.image });
        if (error) throw error;
        return data;
      },
    }),
  changeEmailKey: () => [...profileQueries.all(), "change-email"] as const,
  changeEmail: () =>
    mutationOptions({
      mutationKey: profileQueries.changeEmailKey(),
      mutationFn: async (payload: { newEmail: string }) => {
        const { data, error } = await auth.changeEmail({
          newEmail: payload.newEmail,
          callbackURL: "/profile",
        });
        if (error) throw error;
        return data;
      },
    }),
  changePasswordKey: () => [...profileQueries.all(), "change-password"] as const,
  changePassword: () =>
    mutationOptions({
      mutationKey: profileQueries.changePasswordKey(),
      mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
        const { data, error } = await auth.changePassword({
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword,
          revokeOtherSessions: false,
        });
        if (error) throw error;
        return data;
      },
    }),
  deleteAccountKey: () => [...profileQueries.all(), "delete-account"] as const,
  deleteAccount: () =>
    mutationOptions({
      mutationKey: profileQueries.deleteAccountKey(),
      mutationFn: async (payload: { password: string }) => {
        const { data, error } = await auth.deleteUser({ password: payload.password });
        if (error) throw error;
        return data;
      },
    }),
  revokeSessionKey: () => [...profileQueries.all(), "revoke-session"] as const,
  revokeSession: () =>
    mutationOptions({
      mutationKey: profileQueries.revokeSessionKey(),
      mutationFn: async (token: string) => {
        const { data, error } = await auth.revokeSession({ token });
        if (error) throw error;
        return data;
      },
    }),
  revokeOtherSessionsKey: () => [...profileQueries.all(), "revoke-other-sessions"] as const,
  revokeOtherSessions: () =>
    mutationOptions({
      mutationKey: profileQueries.revokeOtherSessionsKey(),
      mutationFn: async () => {
        const { data, error } = await auth.revokeOtherSessions();
        if (error) throw error;
        return data;
      },
    }),
};
