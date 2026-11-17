import { describe, expect, test } from "vitest";

import type { GetSessionResponse } from "../../../src/types/auth";

import { get, json, signIn, user } from "../../helpers";

describe("GET /api/auth/get-session", () => {
  test("returns the session of a signed in user", async () => {
    const cookie = await signIn();

    const res = await get("/api/auth/get-session", cookie);

    expect(res.status).toBe(200);
    expect((await json<GetSessionResponse>(res))?.user.email).toBe(user.email);
  });

  test("answers 401 without a session cookie", async () => {
    const res = await get("/api/auth/get-session");

    expect(res.status).toBe(401);
  });

  test("answers 401 with an invalid session", async () => {
    const cookie = "better-auth.session_token=forged.token";

    expect((await get("/api/auth/get-session", cookie)).status).toBe(401);
    expect((await get("/trpc/privateData", cookie)).status).toBe(401);
  });
});
