import { Hono } from "hono";

import type { AdminVariables } from "@/middleware/require-admin";

import { requireAdmin } from "@/middleware/require-admin";
import { listUsers } from "@/routes/users/list";
import { updateUser } from "@/routes/users/update";

export const userRoutes = new Hono<{ Variables: AdminVariables }>();

userRoutes.use(requireAdmin);
userRoutes.get("/", listUsers);
userRoutes.patch("/:id", updateUser);
