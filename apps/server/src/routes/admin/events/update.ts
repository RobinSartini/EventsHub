import type { Handler } from "hono";

import prisma from "@EventsHub/db";

import type { AdminVariables } from "../../../middleware/require-admin";

import { updateEventBody } from "../../../types/events";
import { ApiError } from "../../../utils/api-response";
import { eventSelect, findEventOr404, invalid } from "./event-select";

export const updateAdminEvent: Handler<{ Variables: AdminVariables }, "/:id"> = async (c) => {
  const id = c.req.param("id");
  const parsed = updateEventBody.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) {
    throw invalid("Invalid request body", parsed.error);
  }
  const data = parsed.data;
  const existing = await findEventOr404(id);

  // Partial edits are checked against the stored dates so the range can never be inverted.
  const start = new Date(data.startDate ?? existing.startDate);
  const end = data.endDate === undefined ? existing.endDate : data.endDate;
  if (end && new Date(end) < start) {
    throw new ApiError(400, "endDate must be after startDate");
  }
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });
    if (!category) {
      throw new ApiError(400, "Unknown category");
    }
  }

  const event = await prisma.event.update({
    where: { id },
    data,
    select: eventSelect,
  });
  return c.json(event);
};
