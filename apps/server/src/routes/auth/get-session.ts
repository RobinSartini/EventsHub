import { auth } from "@EventsHub/auth";
import { createFactory } from "hono/factory";

import { ApiError } from "../../utils/api-response";
import { toAuthResponse } from "./auth-response";

export const getSession = createFactory().createHandlers(async (c) => {
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
});
