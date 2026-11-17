import { Hono } from "hono";

import { listCategories } from "@/routes/categories/list";

export const categoryRoutes = new Hono();

categoryRoutes.get("/", listCategories);
