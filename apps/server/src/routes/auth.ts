import type { Context } from "hono";

import { auth } from "@EventsHub/auth";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";

import { requireSession } from "../middleware/require-session";
import { signInBody, signUpBody } from "../types/auth";
import { ApiError } from "../utils/api-response";

function validateBody(schema: z.ZodType) {
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

const forward = (c: Context) => auth.handler(c.req.raw);

export const authRoutes = new Hono()
  .post("/sign-up/email", validateBody(signUpBody), forward)
  .post("/sign-in/email", validateBody(signInBody), forward)
  .post("/sign-out", requireSession, forward)
  .get("/get-session", forward)
  .on(["GET", "POST"], "/*", forward);
