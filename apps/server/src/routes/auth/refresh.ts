import { ACCESS_TOKEN_TTL_SECONDS, auth } from "@EventsHub/auth";
import { createFactory } from "hono/factory";

import type { RefreshResponse } from "../../types/auth";

import { requireSession } from "../../middleware/require-session";

export const refresh = createFactory().createHandlers(requireSession, async (c) => {
  const { token } = await auth.api.getToken({ headers: c.req.raw.headers });
  const data: RefreshResponse = {
    accessToken: token,
    tokenType: "Bearer",
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  };
  return c.json(data);
});
