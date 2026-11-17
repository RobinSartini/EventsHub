import prisma from "@EventsHub/db";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { del, signInAs } from "../../helpers";

const findUnique = vi.mocked(prisma.event.findUnique);
const remove = vi.mocked(prisma.event.delete);

beforeEach(() => {
  vi.clearAllMocks();
  findUnique.mockResolvedValue({ id: "e1" } as never);
  remove.mockResolvedValue({ id: "e1" } as never);
});

describe("DELETE /admin/events/:id", () => {
  test("an admin deletes any event", async () => {
    const { cookie } = await signInAs("admin");

    const res = await del("/admin/events/e1", cookie);

    expect(res.status).toBe(204);
    expect(remove).toHaveBeenCalledWith({ where: { id: "e1" } });
  });

  test("an unknown event returns 404", async () => {
    findUnique.mockResolvedValue(null);
    const { cookie } = await signInAs("admin");

    const res = await del("/admin/events/missing", cookie);

    expect(res.status).toBe(404);
    expect(remove).not.toHaveBeenCalled();
  });

  test("a non admin user is rejected with 403", async () => {
    const { cookie } = await signInAs("user");

    const res = await del("/admin/events/e1", cookie);

    expect(res.status).toBe(403);
    expect(remove).not.toHaveBeenCalled();
  });

  test("a visitor is rejected with 401", async () => {
    const res = await del("/admin/events/e1");

    expect(res.status).toBe(401);
    expect(remove).not.toHaveBeenCalled();
  });
});
