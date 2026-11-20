import type { Handler } from "hono";

import prisma from "@EventsHub/db";

import type { AdminVariables } from "@/middleware/require-admin";

import { updateEventBody } from "@/types/events";
import { badRequest, validationError } from "@/errors";
import { eventSelect, findEventOr404 } from "@/routes/admin/events/event-select";

export const updateAdminEvent: Handler<{ Variables: AdminVariables }, "/:id"> = async (c) => {
  const id = c.req.param("id");
  const parsed = updateEventBody.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) {
    throw validationError("Invalid request body", parsed.error);
  }
  const data = parsed.data;
  const existing = await findEventOr404(id);

  const start = new Date(data.startDate ?? existing.startDate);
  const end = data.endDate === undefined ? existing.endDate : data.endDate;
  if (end && new Date(end) < start) {
    throw badRequest("endDate must be after startDate");
  }
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });
    if (!category) {
      throw badRequest("Unknown category");
    }
  }

  const event = await prisma.event.update({
    where: { id },
    data,
    select: eventSelect,
  });
  return c.json(event);
};
