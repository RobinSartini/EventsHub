import { createMiddleware } from "hono/factory";
import type { z } from "zod";

import { validationError } from "@/errors";

export function validateBody(schema: z.ZodType) {
  return createMiddleware(async (c, next) => {
    const body = await c.req.raw
      .clone()
      .json()
      .catch(() => undefined);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw validationError("Invalid request body", parsed.error);
    }
    await next();
  });
}
