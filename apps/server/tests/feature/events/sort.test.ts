import prisma from "@EventsHub/db";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Event } from "@/types/events";

import { get, json } from "@tests/helpers";

const findMany = vi.mocked(prisma.event.findMany);
const count = vi.mocked(prisma.event.count);

const paris = { lat: 48.8566, lng: 2.3522 };
const places = {
  lyon: { latitude: 45.764, longitude: 4.8357 },
  versailles: { latitude: 48.8049, longitude: 2.1204 },
  marseille: { latitude: 43.2965, longitude: 5.3698 },
  nowhere: { latitude: null, longitude: null },
};

function candidate(id: keyof typeof places, day: number) {
  return { id, ...places[id], startDate: new Date(Date.UTC(2027, 0, day)) };
}

function fullEvent(id: keyof typeof places) {
  return { id, name: id, ...places[id], startDate: new Date(Date.UTC(2027, 0, 1)) };
}

function query(params: Record<string, string | number>) {
  return `/events?${new URLSearchParams(Object.entries(params).map(([k, v]): [string, string] => [k, String(v)]))}`;
}

beforeEach(() => {
  vi.clearAllMocks();
  findMany.mockImplementation((async (args: { where: { id?: { in: string[] } } }) =>
    args.where.id
      ? args.where.id.in.map((id) => fullEvent(id as keyof typeof places)).reverse()
      : [
          candidate("nowhere", 1),
          candidate("marseille", 2),
          candidate("lyon", 3),
          candidate("versailles", 4),
        ]) as never);
  count.mockResolvedValue(4);
});

describe("GET /events?sort=distance", () => {
  test("events come nearest first, those without coordinates last, with their distance", async () => {
    const res = await get(query({ sort: "distance", ...paris }));

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Total-Count")).toBe("4");
    const events = await json<Event[]>(res);
    expect(events.map((event) => event.id)).toEqual(["versailles", "lyon", "marseille", "nowhere"]);
    expect(events[1]!.distanceKm).toBeCloseTo(391.5, 0);
    expect(events[3]!.distanceKm).toBeNull();
  });

  test("the sort applies before pagination", async () => {
    const res = await get(query({ sort: "distance", ...paris, page: 2, pageSize: 2 }));

    expect((await json<Event[]>(res)).map((event) => event.id)).toEqual(["marseille", "nowhere"]);
    expect(res.headers.get("X-Total-Count")).toBe("4");
  });

  test("the filters still apply to the candidates", async () => {
    await get(query({ sort: "distance", ...paris, city: "Lyon" }));

    expect(findMany.mock.calls[0]![0]!.where).toEqual({
      status: "published",
      city: { equals: "Lyon", mode: "insensitive" },
    });
  });

  test("sort=distance without a position is rejected", async () => {
    const res = await get(query({ sort: "distance" }));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ details: { sort: [expect.any(String)] } });
  });

  test("lat without lng is rejected", async () => {
    const res = await get(query({ lat: 48.85 }));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ details: { lng: [expect.any(String)] } });
  });

  test("an out of range latitude is rejected", async () => {
    const res = await get(query({ lat: 91, lng: 2 }));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ details: { lat: [expect.any(String)] } });
  });
});

describe("GET /events with a position, sorted by date", () => {
  test("the date order is kept and each event gets its distance", async () => {
    findMany.mockResolvedValue([fullEvent("lyon"), fullEvent("nowhere")] as never);

    const res = await get(query(paris));

    const events = await json<Event[]>(res);
    expect(events.map((event) => event.id)).toEqual(["lyon", "nowhere"]);
    expect(events[0]!.distanceKm).toBeCloseTo(391.5, 0);
    expect(events[1]!.distanceKm).toBeNull();
    expect(findMany.mock.calls[0]![0]).toMatchObject({
      orderBy: [{ startDate: "asc" }, { id: "asc" }],
    });
  });

  test("without a position, events have no distanceKm", async () => {
    findMany.mockResolvedValue([fullEvent("lyon")] as never);

    const events = await json<Event[]>(await get("/events"));

    expect(events[0]).not.toHaveProperty("distanceKm");
  });
});
