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
  priceCents: true,
  isAccessible: true,
  isKidFriendly: true,
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

type Position = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;

function distanceKm(from: Position, latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null) {
    return null;
  }
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const a =
    Math.sin(rad(latitude - from.lat) / 2) ** 2 +
    Math.cos(rad(from.lat)) *
      Math.cos(rad(latitude)) *
      Math.sin(rad(longitude - from.lng) / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// shortcut: sorts every matching event in memory, move the ORDER BY to SQL (PostGIS) past ~10k events
async function pageByDistance(where: EventWhere, from: Position, page: number, pageSize: number) {
  const candidates = await prisma.event.findMany({
    where,
    select: { id: true, latitude: true, longitude: true, startDate: true },
  });
  const ids = candidates
    .map((event) => ({ ...event, distance: distanceKm(from, event.latitude, event.longitude) }))
    .sort(
      (a, b) =>
        (a.distance ?? Infinity) - (b.distance ?? Infinity) ||
        a.startDate.getTime() - b.startDate.getTime() ||
        a.id.localeCompare(b.id),
    )
    .slice((page - 1) * pageSize, page * pageSize)
    .map((event) => event.id);

  const events = await prisma.event.findMany({ where: { id: { in: ids } }, select: eventSelect });
  const byId = new Map(events.map((event) => [event.id, event]));
  return { events: ids.flatMap((id) => byId.get(id) ?? []), total: candidates.length };
}

async function pageByDate(where: EventWhere, page: number, pageSize: number) {
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
  return { events, total };
}

export const listEvents: Handler = async (c) => {
  const parsed = listEventsQuery.safeParse(c.req.query());
  if (!parsed.success) {
    throw validationError("Invalid query", parsed.error);
  }
  const { page, pageSize, sort, lat, lng } = parsed.data;
  const where = eventFilters(parsed.data);
  const from = lat !== undefined && lng !== undefined ? { lat, lng } : undefined;

  const { events, total } =
    sort === "distance" && from
      ? await pageByDistance(where, from, page, pageSize)
      : await pageByDate(where, page, pageSize);

  c.header("X-Total-Count", String(total));
  return c.json(
    from
      ? events.map((event) => ({
          ...event,
          distanceKm: distanceKm(from, event.latitude, event.longitude),
        }))
      : events,
  );
};
