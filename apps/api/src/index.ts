// import { showRoutes } from "hono/dev";

// import { createApp } from "@/lib/app";
// import { v1Routes } from "@/routes/v1";

// const app = createApp();

// app.route("/v1", v1Routes);

// showRoutes(app, {
//   verbose: false,
// });

// export default app;
import { Hono } from "hono";
import { env } from "@beetime/env/api";

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    APP_NAME: env.APP_NAME,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
  });
});

export default app;
