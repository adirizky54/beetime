import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    c.set("user", null);
    c.set("session", null);

    return c.json({ message: "Unauthorized" }, 401);
  }

  // Attach user & session to context for use in routes
  c.set("user", session.user);
  c.set("session", session.session);

  await next();
});
