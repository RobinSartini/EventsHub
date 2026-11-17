import { createMiddleware } from "hono/factory";
import { z } from "zod";

import { ApiError } from "../utils/api-response";

export function validateBody(schema: z.ZodType) {
  return createMiddleware(async (c, next) => {
    const body = await c.req.raw
      .clone()
      .json()
      .catch(() => undefined);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid request body", z.flattenError(parsed.error).fieldErrors);
    }
    await next();
  });
}
