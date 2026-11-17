import { Hono } from "hono";

import { forwardToAuth } from "./auth-response";
import { getSession } from "./get-session";
import { refresh } from "./refresh";
import { signIn } from "./sign-in";
import { signOut } from "./sign-out";
import { signUp } from "./sign-up";

export const authRoutes = new Hono()
  .post("/sign-up/email", ...signUp)
  .post("/sign-in/email", ...signIn)
  .post("/sign-out", ...signOut)
  .get("/get-session", ...getSession)
  .post("/refresh", ...refresh)
  .on(["GET", "POST"], "/*", forwardToAuth);
