import { describe, expect, test } from "vitest";

import { get, post, signIn } from "../../helpers";

describe("POST /api/auth/sign-out", () => {
  test("a signed in user can sign out", async () => {
    const cookie = await signIn();

    const res = await post("/api/auth/sign-out", {}, cookie);

    expect(res.status).toBe(200);
    expect(await (await get("/api/auth/get-session", cookie)).json()).toBeNull();
  });

  test("signing out without a session is rejected with 401", async () => {
    const res = await post("/api/auth/sign-out", {});

    expect(res.status).toBe(401);
  });
});
