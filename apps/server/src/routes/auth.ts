import type { Context } from "hono";

import { ACCESS_TOKEN_TTL_SECONDS, auth } from "@EventsHub/auth";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";

import { requireSession } from "../middleware/require-session";
import type { RefreshResponse } from "../types/auth";

import { signInBody, signUpBody } from "../types/auth";
import { ApiError, ApiResponse } from "../utils/api-response";

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
  .get("/get-session", requireSession, forward)
  .post("/refresh", requireSession, async (c) => {
    const { token } = await auth.api.getToken({ headers: c.req.raw.headers });
    const data: RefreshResponse = {
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
    return c.json(ApiResponse.ok(data));
  })
  .on(["GET", "POST"], "/*", forward);
