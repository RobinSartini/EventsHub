import { auth } from "@EventsHub/auth";
import { createMiddleware } from "hono/factory";

import { unauthorized } from "@/errors";

export const requireSession = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw unauthorized();
  }
  await next();
});
