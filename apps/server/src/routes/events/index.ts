import { Hono } from "hono";

import { listEvents } from "@/routes/events/list";
import { showEvent } from "@/routes/events/show";

export const eventRoutes = new Hono();

eventRoutes.get("/", listEvents);
eventRoutes.get("/:id", showEvent);
