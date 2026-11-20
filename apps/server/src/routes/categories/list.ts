import prisma from "@EventsHub/db";
import type { Handler } from "hono";

export const listCategories: Handler = async (c) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return c.json(categories);
};
