import prisma from "@EventsHub/db";
import { Hono } from "hono";
import { z } from "zod";

import type { ListEventsQuery } from "../types/events";

import { listEventsQuery } from "../types/events";
import { ApiError } from "../utils/api-response";

type EventWhere = NonNullable<Parameters<typeof prisma.event.findMany>[0]>["where"];

const eventSelect = {
  id: true,
  name: true,
  description: true,
  categoryId: true,
  organizerId: true,
  startDate: true,
  endDate: true,
  location: true,
  city: true,
  latitude: true,
  longitude: true,
  capacity: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

function eventFilters({ q, category, from, to, city }: ListEventsQuery): EventWhere {
  return {
    status: "published",
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(category && { category: { is: { OR: [{ slug: category }, { id: category }] } } }),
    ...(city && { city: { equals: city, mode: "insensitive" } }),
    ...((from || to) && {
      startDate: {
        ...(from && { gte: new Date(`${from}T00:00:00.000Z`) }),
        ...(to && { lte: new Date(`${to}T23:59:59.999Z`) }),
      },
    }),
  };
}

export const eventRoutes = new Hono();

eventRoutes.get("/", async (c) => {
  const parsed = listEventsQuery.safeParse(c.req.query());
  if (!parsed.success) {
    throw new ApiError(400, "Invalid query", z.flattenError(parsed.error).fieldErrors);
  }
  const { page, pageSize } = parsed.data;
  const where = eventFilters(parsed.data);

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: [{ startDate: "asc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: eventSelect,
    }),
    prisma.event.count({ where }),
  ]);

  c.header("X-Total-Count", String(total));
  return c.json(events);
});
