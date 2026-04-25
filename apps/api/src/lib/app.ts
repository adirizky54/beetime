import { cors } from "hono/cors";
import { createFactory } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { initLogger } from "evlog";
import { evlog, type EvlogVariables } from 'evlog/hono'

import type { AuthUser, AuthSession } from "@/lib/auth";

interface AppEnv {
  Variables: {
    log: EvlogVariables["Variables"]["log"];
    user: AuthUser | null;
    session: AuthSession | null;
  };
}

export const factory = createFactory<AppEnv>();

export function createRouter() {
  return factory.createApp({ strict: false });
}

export function createApp() {
  const app = createRouter().basePath("/api");

  initLogger();

  app.use(requestId());
  app.use(secureHeaders());
  app.use(evlog());
  app.use(
    "*",
    cors({
      origin: ["http://localhost:3000", "http://localhost:3001"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["Content-Length"],
      credentials: true,
    })
  );
  app.notFound((c) => {
    return c.json({ message: `Not Found - ${c.req.path}` }, 404);
  });
  app.onError((err, c) => {
    c.get("log").error(err);

    if (err instanceof HTTPException) {
      return c.json({ message: err.message }, err.status);
    }

    return c.json({ message: "Internal server error" }, 500);
  });

  return app;
}
