import { and, eq } from "drizzle-orm";
import { members, organizations } from "@/database/schema";
import { db } from "@/lib/db";

/**
 * Retrieves the active organization for a given user.
 *
 * This function first looks up the user's membership record to find their associated
 * organization, then retrieves the full organization details.
 *
 * @param userId - The unique identifier of the user
 * @returns A promise that resolves to the organization object if found, or null if the user
 *          is not a member of any organization
 *
 * @example
 * ```typescript
 * const org = await getActiveOrganization('user-123');
 * if (org) {
 *   console.log(`User belongs to: ${org.name}`);
 * }
 * ```
 */
export async function getActiveOrganization(userId: string) {
  const memberUser = await db.query.members.findFirst({
    where: eq(members.userId, userId),
  });

  if (!memberUser) {
    return null;
  }

  const activeOrganization = await db.query.organizations.findFirst({
    where: eq(organizations.id, memberUser.organizationId),
  });

  return activeOrganization;
}

/**
 * Check if a user is a member of an organization
 * @param organizationId - The organization ID to check
 * @param userId - The user ID to check
 * @returns true if user is a member, false otherwise
 *
 * @example
 * ```typescript
 * const isMember = await isMember('org-123', 'user-123');
 * if (isMember) {
 *   console.log('User is a member of the organization');
 * }
 * ```
 */
export async function isMember(organizationId: string, userId: string) {
  const membership = await db.query.members.findFirst({
    where: and(eq(members.organizationId, organizationId), eq(members.userId, userId)),
  });

  return !!membership;
}
