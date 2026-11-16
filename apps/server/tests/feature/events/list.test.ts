import prisma from "@EventsHub/db";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { EventListResponse } from "../../../src/types/events";
import type { ApiSuccess } from "../../../src/utils/api-response";

import { get, json } from "../../helpers";

const findMany = vi.mocked(prisma.event.findMany);
const count = vi.mocked(prisma.event.count);

function fakeEvent(n: number) {
  return {
    id: `event-${n}`,
    name: `Concert ${n}`,
    description: `Description du concert ${n}`,
    startDate: new Date(Date.UTC(2027, 0, n, 20)),
    endDate: null,
    location: "Le Cargo",
    city: "Valence",
    priceCents: 1500,
    capacity: 200,
    isAccessible: true,
    isKidFriendly: false,
    category: { name: "Musique", slug: "musique" },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  findMany.mockResolvedValue([fakeEvent(1), fakeEvent(2)] as never);
  count.mockResolvedValue(30);
});

describe("GET /events", () => {
  test("a visitor sees the events without being signed in", async () => {
    const res = await get("/events");

    expect(res.status).toBe(200);
    const { data } = await json<ApiSuccess<EventListResponse>>(res);
    expect(data.items).toHaveLength(2);
    expect(data.items[0]).toMatchObject({
      id: "event-1",
      name: "Concert 1",
      city: "Valence",
      startDate: "2027-01-01T20:00:00.000Z",
      category: { slug: "musique" },
    });
  });

  test("the list is paginated with 12 events per page by default", async () => {
    const { data } = await json<ApiSuccess<EventListResponse>>(await get("/events"));

    expect(data).toMatchObject({ page: 1, pageSize: 12, total: 30, totalPages: 3 });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 12 }));
  });

  test("page and pageSize select the requested slice", async () => {
    const { data } = await json<ApiSuccess<EventListResponse>>(
      await get("/events?page=3&pageSize=5"),
    );

    expect(data).toMatchObject({ page: 3, pageSize: 5, totalPages: 6 });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 5 }));
  });

  test("only published events are listed, soonest first", async () => {
    await get("/events");

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "published" },
        orderBy: [{ startDate: "asc" }, { id: "asc" }],
      }),
    );
    expect(count).toHaveBeenCalledWith({ where: { status: "published" } });
  });

  test("a page beyond the last one returns an empty list", async () => {
    findMany.mockResolvedValue([]);

    const { data } = await json<ApiSuccess<EventListResponse>>(await get("/events?page=99"));

    expect(data.items).toEqual([]);
    expect(data.totalPages).toBe(3);
  });

  test("an invalid page or pageSize is rejected with 400", async () => {
    const res = await get("/events?page=0&pageSize=500");

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      success: false,
      error: "Invalid query",
      details: { page: expect.any(Array), pageSize: expect.any(Array) },
    });
    expect(findMany).not.toHaveBeenCalled();
  });
});
