import prisma from "@EventsHub/db";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Event } from "../../../src/types/events";

import { get, json } from "../../helpers";

const findMany = vi.mocked(prisma.event.findMany);
const count = vi.mocked(prisma.event.count);

function fakeEvent(n: number) {
  return {
    id: `event-${n}`,
    name: `Concert ${n}`,
    description: `Description du concert ${n}`,
    categoryId: "cat-musique",
    organizerId: "seed-organizer",
    startDate: new Date(Date.UTC(2027, 0, n, 20)),
    endDate: null,
    location: "Le Cargo",
    city: "Valence",
    latitude: 44.93,
    longitude: 4.89,
    capacity: 200,
    status: "published",
    createdAt: new Date(Date.UTC(2026, 10, 1)),
    updatedAt: new Date(Date.UTC(2026, 10, 1)),
  };
}

function whereOfLastCall() {
  return findMany.mock.calls.at(-1)![0]!.where;
}

beforeEach(() => {
  vi.clearAllMocks();
  findMany.mockResolvedValue([fakeEvent(1), fakeEvent(2)] as never);
  count.mockResolvedValue(30);
});

describe("GET /events", () => {
  test("a visitor gets a plain list of events without being signed in", async () => {
    const res = await get("/events");

    expect(res.status).toBe(200);
    const events = await json<Event[]>(res);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({
      ...fakeEvent(1),
      startDate: "2027-01-01T20:00:00.000Z",
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: "2026-11-01T00:00:00.000Z",
    });
  });

  test("only published events are listed, soonest first", async () => {
    await get("/events");

    expect(whereOfLastCall()).toEqual({ status: "published" });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ startDate: "asc" }, { id: "asc" }] }),
    );
  });

  test("the list is paginated, 12 per page by default, total in X-Total-Count", async () => {
    const res = await get("/events");

    expect(res.headers.get("X-Total-Count")).toBe("30");
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 12 }));
  });

  test("page and pageSize select the requested slice", async () => {
    await get("/events?page=3&pageSize=5");

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 5 }));
  });

  test("q searches the name and the description, case insensitive", async () => {
    await get("/events?q=jazz");

    expect(whereOfLastCall()).toMatchObject({
      OR: [
        { name: { contains: "jazz", mode: "insensitive" } },
        { description: { contains: "jazz", mode: "insensitive" } },
      ],
    });
  });

  test("category filters by category slug or id", async () => {
    await get("/events?category=musique");

    expect(whereOfLastCall()).toMatchObject({
      category: { is: { OR: [{ slug: "musique" }, { id: "musique" }] } },
    });
  });

  test("city filters by city, case insensitive", async () => {
    await get("/events?city=valence");

    expect(whereOfLastCall()).toMatchObject({ city: { equals: "valence", mode: "insensitive" } });
  });

  test("from and to filter the start date, both days included", async () => {
    await get("/events?from=2027-01-01&to=2027-01-31");

    expect(whereOfLastCall()).toMatchObject({
      startDate: {
        gte: new Date("2027-01-01T00:00:00.000Z"),
        lte: new Date("2027-01-31T23:59:59.999Z"),
      },
    });
  });

  test("filters combine and apply to the total too", async () => {
    await get("/events?city=Lyon&category=sport&from=2027-02-01");

    const where = whereOfLastCall();
    expect(where).toMatchObject({ status: "published", city: expect.anything() });
    expect(where).toHaveProperty("category");
    expect(where).toHaveProperty("startDate.gte");
    expect(count).toHaveBeenCalledWith({ where });
  });

  test.each<{ reason: string; query: string }>([
    { reason: "page 0", query: "page=0" },
    { reason: "pageSize too large", query: "pageSize=500" },
    { reason: "malformed date", query: "from=01-02-2027" },
    { reason: "from after to", query: "from=2027-02-01&to=2027-01-01" },
  ])("an invalid query is rejected with 400 ($reason)", async ({ query }) => {
    const res = await get(`/events?${query}`);

    expect(res.status).toBe(400);
    expect(findMany).not.toHaveBeenCalled();
  });
});
