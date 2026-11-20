import { createFactory } from "hono/factory";

import { validateBody } from "@/middleware/validate-body";
import { signUpBody } from "@/types/auth";
import { forwardWithSession } from "@/routes/auth/auth-response";

export const signUp = createFactory().createHandlers(validateBody(signUpBody), forwardWithSession);
