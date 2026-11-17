import { createFactory } from "hono/factory";

import { validateBody } from "../../middleware/validate-body";
import { signInBody } from "../../types/auth";
import { forwardWithSession } from "./auth-response";

export const signIn = createFactory().createHandlers(validateBody(signInBody), forwardWithSession);
