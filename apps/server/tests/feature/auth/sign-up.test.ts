import { describe, expect, test } from "vitest";

import type { SignUpResponse } from "../../../src/types/auth";

import { json, post, signUp, user } from "../../helpers";

describe("POST /api/auth/sign-up/email", () => {
  test("a visitor can create an account", async () => {
    const res = await signUp();

    expect(res.status).toBe(200);
    expect((await json<SignUpResponse>(res)).user).toMatchObject({
      email: user.email,
      name: user.name,
    });
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
});
