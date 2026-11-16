import { describe, expect, test } from "vitest";

import type { SignInResponse } from "../../../src/types/auth";

import { json, post, setUserFields, signUp, user } from "../../helpers";

describe("POST /api/auth/sign-in/email", () => {
  test("a user can sign in with email and password", async () => {
    await signUp();

    const res = await post("/api/auth/sign-in/email", {
      email: user.email,
      password: user.password,
    });

    expect(res.status).toBe(200);
    expect(res.headers.getSetCookie().join()).toContain("session_token");
    expect((await json<SignInResponse>(res)).user.email).toBe(user.email);
  });

  test("a wrong password is rejected with 401", async () => {
    await signUp();

    const res = await post("/api/auth/sign-in/email", {
      email: user.email,
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });

  test("an invalid body is rejected with 400", async () => {
    const res = await post("/api/auth/sign-in/email", { email: "nope" });

    expect(res.status).toBe(400);
  });

  test("a suspended user cannot sign in", async () => {
    const account = { ...user, email: "suspended@example.com" };
    await signUp(account);
    await setUserFields(account.email, { status: "suspended" });

    const res = await post("/api/auth/sign-in/email", {
      email: account.email,
      password: account.password,
    });

    expect(res.status).toBe(403);
    expect(res.headers.getSetCookie().join()).not.toContain("session_token");
  });
});
