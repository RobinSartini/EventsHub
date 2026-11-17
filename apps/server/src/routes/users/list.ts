import type { Handler } from "hono";

import prisma from "@EventsHub/db";

import type { AdminVariables } from "../../middleware/require-admin";

import { listUsersQuery } from "../../types/users";
import { invalid, userSelect } from "./user-select";

export const listUsers: Handler<{ Variables: AdminVariables }> = async (c) => {
  const parsed = listUsersQuery.safeParse(c.req.query());
  if (!parsed.success) {
    throw invalid("Invalid query", parsed.error);
  }
  const { page, pageSize } = parsed.data;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: userSelect,
    }),
    prisma.user.count(),
  ]);

  c.header("X-Total-Count", String(total));
  return c.json(items);
};
