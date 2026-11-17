import type { Handler } from "hono";

import prisma from "@EventsHub/db";

import type { AdminVariables } from "../../middleware/require-admin";

import { updateUserBody } from "../../types/users";
import { ApiError } from "../../utils/api-response";
import { invalid, userSelect } from "./user-select";

export const updateUser: Handler<{ Variables: AdminVariables }> = async (c) => {
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
};
