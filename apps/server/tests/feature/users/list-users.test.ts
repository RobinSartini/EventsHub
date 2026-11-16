import prisma from "@EventsHub/db";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { User } from "../../../src/types/users";

import { get, json, signInAs } from "../../helpers";

const findMany = vi.mocked(prisma.user.findMany);
const count = vi.mocked(prisma.user.count);

const fakeUsers = [
  {
    id: "u1",
    name: "Alice Admin",
    email: "alice@example.com",
    role: "admin",
    status: "active",
    createdAt: new Date("2026-01-02T10:00:00Z"),
  },
  {
    id: "u2",
    name: "Bob Membre",
    email: "bob@example.com",
    role: "user",
    status: "suspended",
    createdAt: new Date("2026-01-01T10:00:00Z"),
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  findMany.mockResolvedValue(fakeUsers as never);
  count.mockResolvedValue(45);
});

describe("GET /users", () => {
  test("an admin lists users with their role and status", async () => {
    const { cookie } = await signInAs("admin");

    const res = await get("/users", cookie);

    expect(res.status).toBe(200);
    expect(await json<User[]>(res)).toEqual([
      expect.objectContaining({ id: "u1", role: "admin", status: "active" }),
      expect.objectContaining({ id: "u2", role: "user", status: "suspended" }),
    ]);
    expect(res.headers.get("X-Total-Count")).toBe("45");
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 20 }));
  });

  test("the list is paginated", async () => {
    const { cookie } = await signInAs("admin");

    await get("/users?page=2&pageSize=10", cookie);

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10 }));
  });

  test("the list never exposes sensitive fields", async () => {
    const { cookie } = await signInAs("admin");

    await get("/users", cookie);

    const { select } = findMany.mock.calls[0]![0]!;
    expect(Object.keys(select!)).toEqual([
      "id",
      "name",
      "email",
      "emailVerified",
      "image",
      "role",
      "status",
      "createdAt",
      "updatedAt",
    ]);
  });

  test("an invalid pagination is rejected with 400", async () => {
    const { cookie } = await signInAs("admin");

    const res = await get("/users?page=0", cookie);

    expect(res.status).toBe(400);
  });

  test("a non admin user is rejected with 403", async () => {
    const { cookie } = await signInAs("user");

    const res = await get("/users", cookie);

    expect(res.status).toBe(403);
    expect(findMany).not.toHaveBeenCalled();
  });

  test("a visitor is rejected with 401", async () => {
    const res = await get("/users");

    expect(res.status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
  });
});
