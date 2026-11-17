import { Hono } from "hono";

import type { AdminVariables } from "../../../middleware/require-admin";

import { requireAdmin } from "../../../middleware/require-admin";
import { deleteAdminEvent } from "./delete";
import { listAdminEvents } from "./list";
import { updateAdminEvent } from "./update";

export const adminEventRoutes = new Hono<{ Variables: AdminVariables }>();

adminEventRoutes.use(requireAdmin);
adminEventRoutes.get("/", listAdminEvents);
adminEventRoutes.patch("/:id", updateAdminEvent);
adminEventRoutes.delete("/:id", deleteAdminEvent);
