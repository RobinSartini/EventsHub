import prisma from "@EventsHub/db";
import { Hono } from "hono";
import { z } from "zod";

import type { AdminVariables } from "../middleware/require-admin";

import { requireAdmin } from "../middleware/require-admin";
import { listUsersQuery, updateUserBody } from "../types/users";
import { ApiError } from "../utils/api-response";

const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

function invalid(message: string, error: z.ZodError) {
  const { formErrors, fieldErrors } = z.flattenError(error);
  return new ApiError(400, message, { formErrors, fieldErrors });
}

export const userRoutes = new Hono<{ Variables: AdminVariables }>();

userRoutes.use(requireAdmin);

userRoutes.get("/", async (c) => {
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
});

userRoutes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const parsed = updateUserBody.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) {
    throw invalid("Invalid request body", parsed.error);
  }
  if (id === c.get("adminId")) {
    throw new ApiError(400, "You cannot change your own role or status");
  }

  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    throw new ApiError(404, "User not found");
  }

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: userSelect,
  });
  if (parsed.data.status === "suspended") {
    await prisma.session.deleteMany({ where: { userId: id } });
  }

  return c.json(user);
});
