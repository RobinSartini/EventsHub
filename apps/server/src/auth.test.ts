import { memoryAdapter } from "better-auth/adapters/memory";
import { describe, expect, test, vi } from "vitest";

import type { GetSessionResponse, SignUpResponse } from "./types/auth";

import app from "./index";

const authPrismaAdapter = await vi.hoisted(async () => {
  const { createRequire } = await import("node:module");
  return createRequire(import.meta.resolve("@EventsHub/auth")).resolve(
    "better-auth/adapters/prisma",
  );
});
vi.mock("@EventsHub/db", () => ({ default: {} }));
vi.mock(authPrismaAdapter, () => ({
  prismaAdapter: () => memoryAdapter({ user: [], session: [], account: [], verification: [] }),
}));

const origin = process.env.CORS_ORIGIN ?? "http://localhost:3001";

function post(path: string, body: unknown, cookie = "") {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, Cookie: cookie },
    body: JSON.stringify(body),
  });
}

function getSession(cookie: string) {
  return app.request("/api/auth/get-session", { headers: { Origin: origin, Cookie: cookie } });
}

async function body<T>(res: Response) {
  return (await res.json()) as T;
}

function cookieOf(res: Response) {
  return res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
}

describe("US-01 auth endpoints", () => {
  const user = { name: "Ada", email: "ada@example.com", password: "password123" };

  test("POST /api/auth/sign-up/email creates an account", async () => {
    const res = await post("/api/auth/sign-up/email", user);

    expect(res.status).toBe(200);
    expect((await body<SignUpResponse>(res)).user).toMatchObject({
      email: user.email,
      name: user.name,
    });
  });

  test("rejects an invalid sign-up body with 400", async () => {
    const res = await post("/api/auth/sign-up/email", {
      name: "A",
      email: "nope",
      password: "short",
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      success: false,
      error: "Invalid request body",
      details: { name: expect.any(Array), email: expect.any(Array), password: expect.any(Array) },
    });
  });

  test("rejects a duplicate email and a too short password", async () => {
    const dup = await post("/api/auth/sign-up/email", user);
    const short = await post("/api/auth/sign-up/email", {
      ...user,
      email: "b@example.com",
      password: "short",
    });

    expect(dup.status).toBe(422);
    expect(short.status).toBe(400);
  });

  test("sign-in, get-session, then sign-out", async () => {
    const signIn = await post("/api/auth/sign-in/email", {
      email: user.email,
      password: user.password,
    });
    expect(signIn.status).toBe(200);
    const cookie = cookieOf(signIn);

    const session = await getSession(cookie);
    expect((await body<GetSessionResponse>(session))?.user.email).toBe(user.email);

    const signOut = await post("/api/auth/sign-out", {}, cookie);
    expect(signOut.status).toBe(200);

    expect(await (await getSession(cookie)).json()).toBeNull();
  });

  test("rejects a wrong password", async () => {
    const res = await post("/api/auth/sign-in/email", {
      email: user.email,
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });

  test("sign-out without a session returns 401", async () => {
    const res = await post("/api/auth/sign-out", {});

    expect(res.status).toBe(401);
  });

  test("an invalid session gets null and 401 on protected routes", async () => {
    const cookie = "better-auth.session_token=forged.token";

    expect(await (await getSession(cookie)).json()).toBeNull();
    const res = await app.request("/trpc/privateData", { headers: { Cookie: cookie } });
    expect(res.status).toBe(401);
  });
});
