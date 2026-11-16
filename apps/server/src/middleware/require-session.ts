import { auth } from "@EventsHub/auth";
import { createMiddleware } from "hono/factory";

import { ApiError } from "../utils/api-response";

export const requireSession = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw new ApiError(401, "Unauthorized");
  }
  await next();
});
