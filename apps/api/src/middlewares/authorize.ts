import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";
import type { statement } from "@/utils/permissions";

type Statements = typeof statement;

type Permissions = {
  [R in keyof Statements]?: Array<Statements[R][number]>;
};

/**
 * Middleware to check if the user has required permissions
 * @param permissions - Object containing resource and actions to check
 * @example
 * ```typescript
 * app.get("/projects", authorize({ project: ["read"] }), async (c) => { ... })
 * ```
 */
export const authorize = (permissions: Permissions) => {
  return createMiddleware(async (c, next) => {
    const hasPermission = await auth.api.hasPermission({
      headers: c.req.raw.headers,
      body: {
        permissions,
      },
    });

    if (!hasPermission.success) {
      return c.json({ message: "You don't have permission" }, 403);
    }

    await next();
  });
};
