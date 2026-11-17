import { Hono } from "hono";

import { listEvents } from "./list";

export const eventRoutes = new Hono();

eventRoutes.get("/", listEvents);
