import { auth } from "@EventsHub/auth";
import { createMiddleware } from "hono/factory";

import { forbidden, unauthorized } from "@/errors";

export type AdminVariables = { adminId: string };

export const requireAdmin = createMiddleware<{ Variables: AdminVariables }>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw unauthorized();
  }
  if (session.user.role !== "admin") {
    throw forbidden();
  }
  c.set("adminId", session.user.id);
  await next();
});
