import { describe, expect, test, vi } from "vitest";

import type { Context } from "../context";
import { appRouter } from "./index";

const findMany = vi.hoisted(() => vi.fn().mockResolvedValue([]));
vi.mock("@EventsHub/db", () => ({ default: { user: { findMany } } }));

describe("users.list", () => {
  // shortcut: red until users.list exists, then drop .fails and the @ts-expect-error
  test.fails("rejects a non-admin user with FORBIDDEN (GET /users → 403)", async () => {
    const caller = appRouter.createCaller({
      session: { user: { id: "u1", role: "user" } },
    } as unknown as Context);

    // @ts-expect-error users router not implemented yet
    await expect(caller.users.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(findMany).not.toHaveBeenCalled();
  });
});
