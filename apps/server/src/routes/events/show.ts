import prisma from "@EventsHub/db";
import type { Handler } from "hono";

import { notFound } from "@/errors";
import { eventSelect } from "@/routes/events/event-select";

export const showEvent: Handler = async (c) => {
  const event = await prisma.event.findUnique({
    where: { id: c.req.param("id") },
    select: eventSelect,
  });
  if (!event) {
    throw notFound("Event");
  }
  return c.json(event);
};
