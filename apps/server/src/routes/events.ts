import prisma from "@EventsHub/db";
import { Hono } from "hono";
import { z } from "zod";

import { listEventsQuery } from "../types/events";
import { ApiError, ApiResponse } from "../utils/api-response";

export const eventRoutes = new Hono().get("/", async (c) => {
  const parsed = listEventsQuery.safeParse(c.req.query());
  if (!parsed.success) {
    throw new ApiError(400, "Invalid query", z.flattenError(parsed.error).fieldErrors);
  }
  const { page, pageSize } = parsed.data;
  const where = { status: "published" as const };

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: [{ startDate: "asc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        city: true,
        priceCents: true,
        capacity: true,
        isAccessible: true,
        isKidFriendly: true,
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return c.json(
    ApiResponse.ok({ items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) }),
  );
});
