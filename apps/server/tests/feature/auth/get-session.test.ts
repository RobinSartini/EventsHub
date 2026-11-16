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

  test("returns null and protected routes answer 401 with an invalid session", async () => {
    const cookie = "better-auth.session_token=forged.token";

    expect(await (await get("/api/auth/get-session", cookie)).json()).toBeNull();
    expect((await get("/trpc/privateData", cookie)).status).toBe(401);
  });
});
