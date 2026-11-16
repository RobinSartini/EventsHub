import type { Context } from "hono";

import { auth } from "@EventsHub/auth";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";

import { requireSession } from "../middleware/require-session";
import { ApiError } from "../utils/api-response";

const signUpBody = z.object({
  name: z.string().trim().min(2),
  email: z.email(),
  password: z.string().min(8).max(128),
});

const signInBody = z.object({
  email: z.email(),
  password: z.string().min(1),
});

function validateBody(schema: z.ZodType) {
  return createMiddleware(async (c, next) => {
    // Read a clone: better-auth still needs the original body.
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

// better-auth keeps cookies, origin checks and password hashing.
const forward = (c: Context) => auth.handler(c.req.raw);

export const authRoutes = new Hono()
  .post("/sign-up/email", validateBody(signUpBody), forward)
  .post("/sign-in/email", validateBody(signInBody), forward)
  .post("/sign-out", requireSession, forward)
  .get("/get-session", forward)
  .on(["GET", "POST"], "/*", forward);
