import type { Context } from "hono";

import { ACCESS_TOKEN_TTL_SECONDS, auth } from "@EventsHub/auth";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";

import { requireSession } from "../middleware/require-session";
import type { AuthSession, RefreshResponse } from "../types/auth";

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

function toAuthResponse({ user, session }: AuthSession) {
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image ?? null,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    session: {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress ?? null,
      userAgent: session.userAgent ?? null,
    },
  };
}

async function forwardWithSession(c: Context) {
  const res = await auth.handler(c.req.raw);
  const body = (await res.json().catch(() => null)) as { token?: string; message?: string } | null;
  if (!res.ok) {
    throw new ApiError(res.status, body?.message ?? "Authentication failed");
  }
  const { internalAdapter } = await auth.$context;
  const found = body?.token ? await internalAdapter.findSession(body.token) : null;
  if (!found) {
    throw new ApiError(500, "Session not created");
  }
  for (const cookie of res.headers.getSetCookie()) {
    c.header("Set-Cookie", cookie, { append: true });
  }
  return c.json(toAuthResponse(found as AuthSession));
}

export const authRoutes = new Hono()
  .post("/sign-up/email", validateBody(signUpBody), forwardWithSession)
  .post("/sign-in/email", validateBody(signInBody), forwardWithSession)
  .post("/sign-out", requireSession, forward)
  .get("/get-session", async (c) => {
    const { headers, response } = await auth.api.getSession({
      headers: c.req.raw.headers,
      returnHeaders: true,
    });
    if (!response) {
      throw new ApiError(401, "Unauthorized");
    }
    for (const cookie of headers.getSetCookie()) {
      c.header("Set-Cookie", cookie, { append: true });
    }
    return c.json(toAuthResponse(response));
  })
  .post("/refresh", requireSession, async (c) => {
    const { token } = await auth.api.getToken({ headers: c.req.raw.headers });
    const data: RefreshResponse = {
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
    return c.json(data);
  })
  .on(["GET", "POST"], "/*", forward);
