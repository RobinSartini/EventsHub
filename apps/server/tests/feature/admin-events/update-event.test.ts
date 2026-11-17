import prisma from "@EventsHub/db";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { AdminEvent } from "@/types/events";

import { json, patch, signInAs } from "@tests/helpers";

const findUnique = vi.mocked(prisma.event.findUnique);
const update = vi.mocked(prisma.event.update);
const findCategory = vi.mocked(prisma.category.findUnique);

const concert = {
  id: "e1",
  name: "Concert",
  status: "published",
  organizerId: "u2",
  startDate: new Date("2026-12-02T10:00:00Z"),
  endDate: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  findUnique.mockResolvedValue({
    id: concert.id,
    startDate: concert.startDate,
    endDate: concert.endDate,
  } as never);
  findCategory.mockResolvedValue({ id: "c1" } as never);
  update.mockImplementation((async ({ data }: { data: object }) => ({
    ...concert,
    ...data,
  })) as never);
});

describe("PATCH /admin/events/:id", () => {
  test("an admin edits an event they do not organize", async () => {
    const { cookie } = await signInAs("admin");

    const res = await patch(
      "/admin/events/e1",
      { name: "Concert annulé", status: "cancelled" },
      cookie,
    );

    expect(res.status).toBe(200);
    expect(await json<AdminEvent>(res)).toMatchObject({
      id: "e1",
      name: "Concert annulé",
      status: "cancelled",
    });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "e1" },
        data: { name: "Concert annulé", status: "cancelled" },
      }),
    );
  });

  test("nullable fields can be cleared", async () => {
    const { cookie } = await signInAs("admin");

    const res = await patch("/admin/events/e1", { description: null, capacity: null }, cookie);

    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { description: null, capacity: null } }),
    );
  });

  test("an end date before the stored start date is rejected with 400", async () => {
    const { cookie } = await signInAs("admin");

    const res = await patch("/admin/events/e1", { endDate: "2026-12-01T10:00:00Z" }, cookie);

    expect(res.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  test("an admin moves an event to an existing category", async () => {
    const { cookie } = await signInAs("admin");

    const res = await patch("/admin/events/e1", { categoryId: "c1" }, cookie);

    expect(res.status).toBe(200);
    expect(findCategory).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "c1" } }));
  });

  test("an unknown category is rejected with 400", async () => {
    findCategory.mockResolvedValue(null);
    const { cookie } = await signInAs("admin");

    const res = await patch("/admin/events/e1", { categoryId: "missing" }, cookie);

    expect(res.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  test("an unknown event returns 404", async () => {
    findUnique.mockResolvedValue(null);
    const { cookie } = await signInAs("admin");

    const res = await patch("/admin/events/missing", { name: "X" }, cookie);

    expect(res.status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });

  test.each<{ reason: string; body: Record<string, unknown> }>([
    { reason: "empty body", body: {} },
    { reason: "unknown status", body: { status: "deleted" } },
    { reason: "empty name", body: { name: " " } },
    { reason: "negative price", body: { priceCents: -1 } },
    { reason: "invalid date", body: { startDate: "tomorrow" } },
    {
      reason: "end before start",
      body: { startDate: "2026-12-02T10:00:00Z", endDate: "2026-12-01T10:00:00Z" },
    },
    { reason: "organizer change", body: { organizerId: "u3" } },
  ])("an invalid body is rejected with 400 ($reason)", async ({ body }) => {
    const { cookie } = await signInAs("admin");

    const res = await patch("/admin/events/e1", body, cookie);

    expect(res.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  test("a non admin user is rejected with 403", async () => {
    const { cookie } = await signInAs("user");

    const res = await patch("/admin/events/e1", { name: "X" }, cookie);

    expect(res.status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  test("a visitor is rejected with 401", async () => {
    const res = await patch("/admin/events/e1", { name: "X" });

    expect(res.status).toBe(401);
  });
});
