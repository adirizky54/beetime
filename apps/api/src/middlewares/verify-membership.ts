import { factory } from "@/lib/app";
import { isMember } from "@/utils/access";

export const verifyMembership = factory.createMiddleware(async (c, next) => {
  const session = c.get("session")!;
  const orgId = c.req.param("orgId")!;

  const isMemberOfOrg = await isMember(orgId, session.userId);

  if (!isMemberOfOrg) {
    return c.json({ message: "Data not found!" }, 404);
  }

  await next();
});
