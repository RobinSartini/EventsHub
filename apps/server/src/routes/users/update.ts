import type { Handler } from "hono";

import prisma from "@EventsHub/db";

import type { AdminVariables } from "@/middleware/require-admin";

import { updateUserBody } from "@/types/users";
import { badRequest, notFound, validationError } from "@/errors";
import { userSelect } from "@/routes/users/user-select";

export const updateUser: Handler<{ Variables: AdminVariables }> = async (c) => {
  const id = c.req.param("id");
  const parsed = updateUserBody.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) {
    throw validationError("Invalid request body", parsed.error);
  }
  if (id === c.get("adminId")) {
    throw badRequest("You cannot change your own role or status");
  }

  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    throw notFound("User");
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
};
