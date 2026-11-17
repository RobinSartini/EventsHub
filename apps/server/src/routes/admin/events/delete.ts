import type { Handler } from "hono";

import prisma from "@EventsHub/db";

import type { AdminVariables } from "@/middleware/require-admin";

import { findEventOr404 } from "@/routes/admin/events/event-select";

export const deleteAdminEvent: Handler<{ Variables: AdminVariables }, "/:id"> = async (c) => {
  const id = c.req.param("id");
  await findEventOr404(id);

  await prisma.event.delete({ where: { id } });
  return c.body(null, 204);
};
