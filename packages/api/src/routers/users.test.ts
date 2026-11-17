import { describe, expect, test, vi } from "vitest";

import type { Context } from "../context";
import { appRouter } from "./index";

const findMany = vi.hoisted(() => vi.fn().mockResolvedValue([]));
vi.mock("@EventsHub/db", () => ({ default: { user: { findMany } } }));

const adminCtx = {
  session: { user: { id: "admin1", role: "admin" } },
} as unknown as Context;

const userCtx = {
  session: { user: { id: "u1", role: "user" } },
} as unknown as Context;

const users = [
  {
    id: "u2",
    name: "Alice",
    email: "alice@test.com",
    emailVerified: true,
    image: null,
    createdAt: new Date("2026-11-01T10:00:00Z"),
    updatedAt: new Date("2026-11-01T10:00:00Z"),
  },
];

// shortcut: red until users.list exists, then drop .fails and the @ts-expect-error
describe("users.list (GET /users)", () => {
  test.fails("returns the users list to an admin (200)", async () => {
    findMany.mockResolvedValueOnce(users);
    const caller = appRouter.createCaller(adminCtx);

    // @ts-expect-error users router not implemented yet
    await expect(caller.users.list()).resolves.toEqual(users);
  });

  test.fails("rejects an unauthenticated request with UNAUTHORIZED (401)", async () => {
    findMany.mockClear();
    const caller = appRouter.createCaller({ session: null } as Context);

    // @ts-expect-error users router not implemented yet
    await expect(caller.users.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(findMany).not.toHaveBeenCalled();
  });

  test.fails("rejects a non-admin user with FORBIDDEN (403)", async () => {
    findMany.mockClear();
    const caller = appRouter.createCaller(userCtx);

    // @ts-expect-error users router not implemented yet
    await expect(caller.users.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(findMany).not.toHaveBeenCalled();
  });

  test.fails("answers INTERNAL_SERVER_ERROR when the database fails (500)", async () => {
    findMany.mockRejectedValueOnce(new Error("db down"));
    const caller = appRouter.createCaller(adminCtx);

    // @ts-expect-error users router not implemented yet
    await expect(caller.users.list()).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});
