import * as v from 'valibot'

const EnvSchema = v.object({
  APP_NAME: v.string(),
  APP_ORIGIN: v.pipe(v.string(), v.nonEmpty(), v.url()),
  DATABASE_URL: v.pipe(v.string(), v.url()),
  PORT: v.string(),
  BETTER_AUTH_SECRET: v.pipe(v.string(), v.minLength(32)),
  NODE_ENV: v.optional(v.picklist(['development', 'production', 'test']), 'development'),
});

export const env = v.parse(EnvSchema, process.env);
