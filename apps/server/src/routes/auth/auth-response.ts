import type { Context } from "hono";

import { auth } from "@EventsHub/auth";

import type { AuthSession } from "@/types/auth";

import { ApiError } from "@/errors";

export const forwardToAuth = (c: Context) => auth.handler(c.req.raw);

export function toAuthResponse({ user, session }: AuthSession) {
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

export async function forwardWithSession(c: Context) {
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
