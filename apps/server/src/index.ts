import { createContext } from "@EventsHub/api/context";
import { appRouter } from "@EventsHub/api/routers/index";
import { env } from "@EventsHub/env/server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { authRoutes } from "./routes/auth";
import { eventRoutes } from "./routes/events";
import { userRoutes } from "./routes/users";
import { errorHandler } from "./utils/error-handler";

const app = new Hono();

app.onError(errorHandler);

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["X-Total-Count"],
    credentials: true,
  }),
);

app.route("/api/auth", authRoutes);
app.route("/events", eventRoutes);
app.route("/users", userRoutes);

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
