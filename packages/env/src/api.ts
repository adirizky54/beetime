import * as v from "valibot";

const EnvSchema = v.object({
  APP_NAME: v.string(),
  APP_ORIGIN: v.pipe(v.string(), v.nonEmpty(), v.url()),
  PORT: v.string(),
  DATABASE_URL: v.pipe(v.string(), v.url()),
  BETTER_AUTH_SECRET: v.pipe(v.string(), v.minLength(32)),
  RESEND_API_KEY: v.string(),
  RESEND_EMAIL_FROM: v.pipe(v.string(), v.email()),
});

export const env = v.parse(EnvSchema, process.env);

export type Env = v.InferOutput<typeof EnvSchema>;
