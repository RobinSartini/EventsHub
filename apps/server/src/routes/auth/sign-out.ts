import { createFactory } from "hono/factory";

import { requireSession } from "@/middleware/require-session";
import { forwardToAuth } from "@/routes/auth/auth-response";

export const signOut = createFactory().createHandlers(requireSession, forwardToAuth);
