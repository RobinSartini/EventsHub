import { Hono } from "hono";

import { listEvents } from "@/routes/events/list";

export const eventRoutes = new Hono();

eventRoutes.get("/", listEvents);
