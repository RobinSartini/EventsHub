import prisma from "@EventsHub/db";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { AdminUser } from "../../../src/types/admin-users";
import type { ApiSuccess } from "../../../src/utils/api-response";

import { json, patch, signInAs } from "../../helpers";

const findUnique = vi.mocked(prisma.user.findUnique);
const update = vi.mocked(prisma.user.update);
const deleteSessions = vi.mocked(prisma.session.deleteMany);

const bob = {
  id: "u2",
  name: "Bob Membre",
  email: "bob@example.com",
  role: "user",
  status: "active",
  createdAt: new Date("2026-01-01T10:00:00Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  findUnique.mockResolvedValue({ id: bob.id } as never);
  update.mockImplementation((async ({ data }: { data: object }) => ({ ...bob, ...data })) as never);
});

describe("PATCH /admin/users/:id", () => {
  test("an admin changes the role of a user", async () => {
    const { cookie } = await signInAs("admin");

    const res = await patch("/admin/users/u2", { role: "admin" }, cookie);

    expect(res.status).toBe(200);
    expect((await json<ApiSuccess<AdminUser>>(res)).data).toMatchObject({
      id: "u2",
      role: "admin",
    });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u2" }, data: { role: "admin" } }),
    );
    expect(deleteSessions).not.toHaveBeenCalled();
  });

  test("suspending a user also signs them out everywhere", async () => {
    const { cookie } = await signInAs("admin");

    const res = await patch("/admin/users/u2", { status: "suspended" }, cookie);

    expect(res.status).toBe(200);
    expect((await json<ApiSuccess<AdminUser>>(res)).data.status).toBe("suspended");
    expect(deleteSessions).toHaveBeenCalledWith({ where: { userId: "u2" } });
  });

  test("an admin reactivates a suspended user", async () => {
    const { cookie } = await signInAs("admin");

    const res = await patch("/admin/users/u2", { status: "active" }, cookie);

    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: "active" } }));
  });

  test("an unknown user returns 404", async () => {
    findUnique.mockResolvedValue(null);
    const { cookie } = await signInAs("admin");

    const res = await patch("/admin/users/missing", { role: "admin" }, cookie);

    expect(res.status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });

  test.each<{ reason: string; body: Record<string, string> }>([
    { reason: "empty body", body: {} },
    { reason: "unknown role", body: { role: "superadmin" } },
    { reason: "unknown status", body: { status: "banned" } },
    { reason: "extra field", body: { role: "admin", email: "x@example.com" } },
  ])("an invalid body is rejected with 400 ($reason)", async ({ body }) => {
    const { cookie } = await signInAs("admin");

    const res = await patch("/admin/users/u2", body, cookie);

    expect(res.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  test("an admin cannot change their own role or status", async () => {
    const { id, cookie } = await signInAs("admin");

    const res = await patch(`/admin/users/${id}`, { role: "user" }, cookie);

    expect(res.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  test("a non admin user is rejected with 403", async () => {
    const { cookie } = await signInAs("user");

    const res = await patch("/admin/users/u2", { role: "admin" }, cookie);

    expect(res.status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  test("a visitor is rejected with 401", async () => {
    const res = await patch("/admin/users/u2", { role: "admin" });

    expect(res.status).toBe(401);
  });
});
