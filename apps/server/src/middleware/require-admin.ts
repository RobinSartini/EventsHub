import { auth } from "@EventsHub/auth";
import { createMiddleware } from "hono/factory";

import { ApiError } from "../utils/api-response";

export type AdminVariables = { adminId: string };

export const requireAdmin = createMiddleware<{ Variables: AdminVariables }>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw new ApiError(401, "Unauthorized");
  }
  if (session.user.role !== "admin") {
    throw new ApiError(403, "Forbidden");
  }
  c.set("adminId", session.user.id);
  await next();
});
