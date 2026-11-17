import prisma from "@EventsHub/db";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { AdminEvent } from "@/types/events";

import { get, json, signInAs } from "@tests/helpers";

const findMany = vi.mocked(prisma.event.findMany);
const count = vi.mocked(prisma.event.count);

const fakeEvents = [
  { id: "e1", name: "Concert", status: "published", organizerId: "u1" },
  { id: "e2", name: "Salon", status: "cancelled", organizerId: "u2" },
];

beforeEach(() => {
  vi.clearAllMocks();
  findMany.mockResolvedValue(fakeEvents as never);
  count.mockResolvedValue(42);
});

describe("GET /admin/events", () => {
  test("an admin lists every event, cancelled ones included", async () => {
    const { cookie } = await signInAs("admin");

    const res = await get("/admin/events", cookie);

    expect(res.status).toBe(200);
    expect(await json<AdminEvent[]>(res)).toEqual([
      expect.objectContaining({ id: "e1", status: "published" }),
      expect.objectContaining({ id: "e2", status: "cancelled" }),
    ]);
    expect(res.headers.get("X-Total-Count")).toBe("42");
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 20 }));
    expect(findMany.mock.calls[0]![0]).not.toHaveProperty("where");
    expect(count).toHaveBeenCalledWith();
  });

  test("the list is paginated", async () => {
    const { cookie } = await signInAs("admin");

    await get("/admin/events?page=3&pageSize=10", cookie);

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 10 }));
  });

  test("an invalid pagination is rejected with 400", async () => {
    const { cookie } = await signInAs("admin");

    const res = await get("/admin/events?pageSize=500", cookie);

    expect(res.status).toBe(400);
    expect(findMany).not.toHaveBeenCalled();
  });

  test("a non admin user is rejected with 403", async () => {
    const { cookie } = await signInAs("user");

    const res = await get("/admin/events", cookie);

    expect(res.status).toBe(403);
    expect(findMany).not.toHaveBeenCalled();
  });

  test("a visitor is rejected with 401", async () => {
    const res = await get("/admin/events");

    expect(res.status).toBe(401);
  });
});
