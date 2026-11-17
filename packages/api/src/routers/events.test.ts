import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Context } from "../context";
import { appRouter } from "./index";

const findMany = vi.hoisted(() => vi.fn().mockResolvedValue([]));
vi.mock("@EventsHub/db", () => ({ default: { event: { findMany } } }));

const caller = () => appRouter.createCaller({ session: null } as Context);

function whereArg() {
  return findMany.mock.calls[0]?.[0]?.where ?? {};
}

const events = [
  {
    id: "e1",
    name: "Concert Jazz",
    organizerId: "o1",
    startDate: new Date("2026-12-01T20:00:00Z"),
    location: "Valence",
    status: "published",
  },
];

// shortcut: red until events.list exists, then drop .fails and the @ts-expect-error
describe("events.list (GET /events)", () => {
  beforeEach(() => {
    findMany.mockClear();
  });

  test.fails("returns the events list without authentication (200)", async () => {
    findMany.mockResolvedValueOnce(events);

    // @ts-expect-error events router not implemented yet
    await expect(caller().events.list({})).resolves.toEqual(events);
  });

  test.fails("filters events by city (GET /events?city=)", async () => {
    // @ts-expect-error events router not implemented yet
    await caller().events.list({ city: "Valence" });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ city: "Valence" }) }),
    );
  });

  test.fails("filters events by keyword (GET /events?q=)", async () => {
    // @ts-expect-error events router not implemented yet
    await caller().events.list({ q: "jazz" });

    expect(JSON.stringify(whereArg())).toContain("jazz");
  });

  test.fails("filters events by category (GET /events?category=)", async () => {
    // @ts-expect-error events router not implemented yet
    await caller().events.list({ category: "concert" });

    expect(JSON.stringify(whereArg())).toContain("concert");
  });

  test.fails("filters events between from and to, both inclusive (GET /events?from=&to=)", async () => {
    // @ts-expect-error events router not implemented yet
    await caller().events.list({ from: "2026-12-01", to: "2026-12-31" });

    const { startDate } = whereArg();
    const lower: Date = startDate.gte;
    const upper: Date = startDate.lte ?? startDate.lt;

    expect(lower.getTime()).toBeLessThanOrEqual(new Date("2026-12-01T00:00:00Z").getTime());
    expect(upper.getTime()).toBeGreaterThanOrEqual(new Date("2026-12-31T23:59:59Z").getTime());
    expect(upper.getTime()).toBeLessThanOrEqual(new Date("2027-01-01T00:00:00Z").getTime());
  });

  test.fails("answers INTERNAL_SERVER_ERROR when the database fails (500)", async () => {
    findMany.mockRejectedValueOnce(new Error("db down"));

    // @ts-expect-error events router not implemented yet
    await expect(caller().events.list({})).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });
});
