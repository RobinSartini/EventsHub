import { describe, expect, test } from "vitest";

import type { AuthResponse } from "../../../src/types/auth";

import { json, post, signUp, user } from "../../helpers";

describe("POST /api/auth/sign-up/email", () => {
  test("a visitor can create an account", async () => {
    const res = await signUp();

    expect(res.status).toBe(200);
    expect(res.headers.getSetCookie().join()).toContain("session_token");
    const body = await json<AuthResponse>(res);
    expect(body.user).toMatchObject({ email: user.email, name: user.name });
    expect(body.session.userId).toBe(body.user.id);
  });

  test("an invalid body is rejected with 400 and field errors", async () => {
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

  test("an email already in use is rejected with 422", async () => {
    const account = { ...user, email: "taken@example.com" };
    await signUp(account);

    const res = await signUp(account);

    expect(res.status).toBe(422);
  });

  test("a visitor cannot choose their own role or status", async () => {
    const res = await post("/api/auth/sign-up/email", {
      ...user,
      email: "sneaky@example.com",
      role: "admin",
      status: "active",
    });

    expect(res.status).toBe(200);
    expect((await json<AuthResponse>(res)).user).toMatchObject({
      role: "user",
      status: "active",
    });
  });

  test("a new account is a user with an active status", async () => {
    const res = await signUp({ ...user, email: "fresh@example.com" });

    expect((await json<AuthResponse>(res)).user).toMatchObject({
      role: "user",
      status: "active",
    });
  });
});
