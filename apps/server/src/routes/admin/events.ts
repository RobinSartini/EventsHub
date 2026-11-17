import prisma from "@EventsHub/db";
import { Hono } from "hono";
import { z } from "zod";

import type { AdminVariables } from "../../middleware/require-admin";

import { requireAdmin } from "../../middleware/require-admin";
import { listAdminEventsQuery, updateEventBody } from "../../types/events";
import { ApiError } from "../../utils/api-response";

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

function invalid(message: string, error: z.ZodError) {
  const { formErrors, fieldErrors } = z.flattenError(error);
  return new ApiError(400, message, { formErrors, fieldErrors });
}

async function findEventOr404(id: string) {
  const existing = await prisma.event.findUnique({
    where: { id },
    select: { id: true, startDate: true, endDate: true },
  });
  if (!existing) {
    throw new ApiError(404, "Event not found");
  }
  return existing;
}

export const adminEventRoutes = new Hono<{ Variables: AdminVariables }>();

adminEventRoutes.use(requireAdmin);

adminEventRoutes.get("/", async (c) => {
  const parsed = listAdminEventsQuery.safeParse(c.req.query());
  if (!parsed.success) {
    throw invalid("Invalid query", parsed.error);
  }
  const { page, pageSize } = parsed.data;

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      orderBy: [{ startDate: "desc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: eventSelect,
    }),
    prisma.event.count(),
  ]);

  c.header("X-Total-Count", String(total));
  return c.json(items);
});

adminEventRoutes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const parsed = updateEventBody.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) {
    throw invalid("Invalid request body", parsed.error);
  }
  const data = parsed.data;
  const existing = await findEventOr404(id);

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
});

adminEventRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await findEventOr404(id);

  await prisma.event.delete({ where: { id } });
  return c.body(null, 204);
});
