import { Hono } from "hono";

import type { AdminVariables } from "@/middleware/require-admin";

import { requireAdmin } from "@/middleware/require-admin";
import { deleteAdminEvent } from "@/routes/admin/events/delete";
import { listAdminEvents } from "@/routes/admin/events/list";
import { updateAdminEvent } from "@/routes/admin/events/update";

export const adminEventRoutes = new Hono<{ Variables: AdminVariables }>();

adminEventRoutes.use(requireAdmin);
adminEventRoutes.get("/", listAdminEvents);
adminEventRoutes.patch("/:id", updateAdminEvent);
adminEventRoutes.delete("/:id", deleteAdminEvent);
