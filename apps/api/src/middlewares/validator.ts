import { vValidator as vv } from "@hono/valibot-validator";
import type { ValidationTargets } from "hono";
import { type GenericSchema, type GenericSchemaAsync, flatten } from "valibot"

export const validator = <T extends GenericSchema | GenericSchemaAsync, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T
) =>
  vv(target, schema, (result, c) => {
    if (!result.success) {
      const errors = flatten(result.issues);

      return c.json({
        message: "Some fields are invalid. Please check your input.",
        errors: errors.nested,
       }, 400);
    }
  });