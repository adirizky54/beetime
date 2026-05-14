import { auth } from "@/lib/auth";

export async function getCurrentUser(headers: Headers) {
  const session = await auth.api.getSession({ headers });

  if (!session) {
    return null;
  }

  const organizations = await auth.api.listOrganizations({ headers });

  return {
    ...session,
    organizations: organizations,
  };
}
