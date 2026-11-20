import type { Handler } from "hono";

import prisma from "@EventsHub/db";

import type { AdminVariables } from "@/middleware/require-admin";

import { listAdminEventsQuery } from "@/types/events";
import { validationError } from "@/errors";
import { eventSelect } from "@/routes/admin/events/event-select";

export const listAdminEvents: Handler<{ Variables: AdminVariables }> = async (c) => {
  const parsed = listAdminEventsQuery.safeParse(c.req.query());
  if (!parsed.success) {
    throw validationError("Invalid query", parsed.error);
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
};
