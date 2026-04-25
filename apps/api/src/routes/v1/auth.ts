import { createRouter } from "@/lib/app";
import { auth } from "@/lib/auth";

export const authRoutes = createRouter();

authRoutes.on(["POST", "GET"], "/*", (c) => {
  return auth.handler(c.req.raw);
});
