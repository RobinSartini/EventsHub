import { auth } from "@EventsHub/auth";
import { createFactory } from "hono/factory";

import { unauthorized } from "@/errors";
import { toAuthResponse } from "@/routes/auth/auth-response";

export const getSession = createFactory().createHandlers(async (c) => {
  const { headers, response } = await auth.api.getSession({
    headers: c.req.raw.headers,
    returnHeaders: true,
  });
  if (!response) {
    throw unauthorized();
  }
  for (const cookie of headers.getSetCookie()) {
    c.header("Set-Cookie", cookie, { append: true });
  }
  return c.json(toAuthResponse(response));
});
