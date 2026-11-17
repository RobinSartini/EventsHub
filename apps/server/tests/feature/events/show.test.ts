import prisma from "@EventsHub/db";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Event } from "@/types/events";

import { eventSelect } from "@/routes/events/event-select";
import { get, json } from "@tests/helpers";

const findUnique = vi.mocked(prisma.event.findUnique);

const event = {
  id: "event-1",
  name: "Nuit Fluo",
  description: "Soirée électro",
  categoryId: "cat-musique",
  organizerId: "seed-organizer",
  startDate: new Date(Date.UTC(2027, 0, 15, 20)),
  endDate: null,
  location: "Le Cargo",
  city: "Valence",
  latitude: 44.93,
  longitude: 4.89,
  capacity: 200,
  status: "published",
  priceCents: 1500,
  isAccessible: true,
  isKidFriendly: false,
  createdAt: new Date(Date.UTC(2026, 10, 1)),
  updatedAt: new Date(Date.UTC(2026, 10, 1)),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /events/:id", () => {
  test("a visitor gets the event details without being signed in", async () => {
    findUnique.mockResolvedValue(event as never);

    const res = await get("/events/event-1");

    expect(res.status).toBe(200);
    expect(await json<Event>(res)).toEqual({
      ...event,
      startDate: "2027-01-15T20:00:00.000Z",
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: "2026-11-01T00:00:00.000Z",
    });
    expect(findUnique).toHaveBeenCalledWith({ where: { id: "event-1" }, select: eventSelect });
  });

  test("a cancelled event is still returned, with its status", async () => {
    findUnique.mockResolvedValue({ ...event, status: "cancelled" } as never);

    const res = await get("/events/event-1");

    expect(res.status).toBe(200);
    expect(await json<Event>(res)).toMatchObject({ status: "cancelled" });
  });

  test("an unknown event returns 404", async () => {
    findUnique.mockResolvedValue(null);

    const res = await get("/events/unknown");

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ success: false, status: 404, error: "Event not found" });
  });
});
