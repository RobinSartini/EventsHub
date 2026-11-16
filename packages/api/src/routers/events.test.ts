import { describe, expect, test, vi } from "vitest";

import type { Context } from "../context";
import { appRouter } from "./index";

const findMany = vi.hoisted(() => vi.fn().mockResolvedValue([]));
vi.mock("@EventsHub/db", () => ({ default: { event: { findMany } } }));

describe("events.list", () => {
  // shortcut: red until events.list exists, then drop .fails and the @ts-expect-error
  test.fails("filters events by city (GET /events?city=)", async () => {
    const caller = appRouter.createCaller({ session: null } as Context);

    // @ts-expect-error events router not implemented yet
    await caller.events.list({ city: "Valence" });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ city: "Valence" }) }),
    );
  });
});
