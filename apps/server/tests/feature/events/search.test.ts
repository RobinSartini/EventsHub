import prisma from "@EventsHub/db";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Event } from "@/types/events";

import { get, json } from "@tests/helpers";

const findMany = vi.mocked(prisma.event.findMany);
const count = vi.mocked(prisma.event.count);

function whereOfLastCall() {
  return findMany.mock.calls.at(-1)![0]!.where;
}

function keyword(term: string) {
  const match = { contains: term, mode: "insensitive" };
  return {
    OR: [
      { name: match },
      { description: match },
      { location: match },
      { city: match },
      { category: { is: { name: match } } },
    ],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  findMany.mockResolvedValue([]);
  count.mockResolvedValue(0);
});

describe("GET /events?q=", () => {
  test("a visitor searches by keyword without being signed in", async () => {
    findMany.mockResolvedValue([{ id: "event-1", name: "Soirée jazz" }] as never);
    count.mockResolvedValue(1);

    const res = await get("/events?q=jazz");

    expect(res.status).toBe(200);
    expect(await json<Event[]>(res)).toEqual([{ id: "event-1", name: "Soirée jazz" }]);
    expect(res.headers.get("X-Total-Count")).toBe("1");
  });

  test("the keyword is searched in name, description, venue, city and category, case insensitive", async () => {
    await get("/events?q=Jazz");

    expect(whereOfLastCall()).toEqual({ status: "published", AND: [keyword("Jazz")] });
  });

  test("every word of the search must match", async () => {
    await get(`/events?q=${encodeURIComponent("  concert   lyon ")}`);

    expect(whereOfLastCall()).toMatchObject({ AND: [keyword("concert"), keyword("lyon")] });
  });

  test("the search keeps the other filters and only published events", async () => {
    await get("/events?q=jazz&city=Valence&from=2027-01-01");

    const where = whereOfLastCall();
    expect(where).toMatchObject({
      status: "published",
      AND: [keyword("jazz")],
      city: { equals: "Valence", mode: "insensitive" },
      startDate: { gte: new Date("2027-01-01T00:00:00.000Z") },
    });
    expect(count).toHaveBeenCalledWith({ where });
  });

  test("no match returns an empty list with a total of 0", async () => {
    const res = await get("/events?q=introuvable");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
    expect(res.headers.get("X-Total-Count")).toBe("0");
  });

  test("a blank search is ignored and lists all events", async () => {
    const res = await get(`/events?q=${encodeURIComponent("   ")}`);

    expect(res.status).toBe(200);
    expect(whereOfLastCall()).toEqual({ status: "published" });
  });

  test("a search longer than 100 characters is rejected with 400", async () => {
    const res = await get(`/events?q=${"a".repeat(101)}`);

    expect(res.status).toBe(400);
    expect(findMany).not.toHaveBeenCalled();
  });
});
