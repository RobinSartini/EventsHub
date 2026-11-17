import prisma from "@EventsHub/db";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Category } from "@/types/events";

import { get, json } from "@tests/helpers";

const findMany = vi.mocked(prisma.category.findMany);

beforeEach(() => {
  vi.clearAllMocks();
  findMany.mockResolvedValue([
    { id: "cat-1", name: "Musique", slug: "musique" },
    { id: "cat-2", name: "Sport", slug: "sport" },
  ] as never);
});

describe("GET /categories", () => {
  test("a visitor gets every category sorted by name, without being signed in", async () => {
    const res = await get("/categories");

    expect(res.status).toBe(200);
    expect(await json<Category[]>(res)).toEqual([
      { id: "cat-1", name: "Musique", slug: "musique" },
      { id: "cat-2", name: "Sport", slug: "sport" },
    ]);
    expect(findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });
  });
});
