import prisma from "@EventsHub/db";
import type { Handler } from "hono";

import type { ListEventsQuery } from "@/types/events";

import { listEventsQuery } from "@/types/events";
import { validationError } from "@/errors";

type EventWhere = NonNullable<NonNullable<Parameters<typeof prisma.event.findMany>[0]>["where"]>;

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

function keywordFilter(term: string): EventWhere {
  const match = { contains: term, mode: "insensitive" } as const;
  return {
    OR: [
      { name: match },
      { description: match },
      { location: match },
      { city: match },
      { category: { is: { name: match } } },
    ],
  };
}

function eventFilters({ q, category, from, to, city }: ListEventsQuery): EventWhere {
  return {
    status: "published",
    ...(q && { AND: q.split(/\s+/).map(keywordFilter) }),
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

export const listEvents: Handler = async (c) => {
  const parsed = listEventsQuery.safeParse(c.req.query());
  if (!parsed.success) {
    throw validationError("Invalid query", parsed.error);
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
};
