import { Hono } from "hono";

import { forwardToAuth } from "@/routes/auth/auth-response";
import { getSession } from "@/routes/auth/get-session";
import { refresh } from "@/routes/auth/refresh";
import { signIn } from "@/routes/auth/sign-in";
import { signOut } from "@/routes/auth/sign-out";
import { signUp } from "@/routes/auth/sign-up";

export const authRoutes = new Hono()
  .post("/sign-up/email", ...signUp)
  .post("/sign-in/email", ...signIn)
  .post("/sign-out", ...signOut)
  .get("/get-session", ...getSession)
  .post("/refresh", ...refresh)
  .on(["GET", "POST"], "/*", forwardToAuth);
