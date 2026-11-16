import { describe, expect, test } from "vitest";

import type { AuthResponse } from "../../../src/types/auth";

import { get, json, signIn, user } from "../../helpers";

describe("GET /api/auth/get-session", () => {
  test("returns the user and the session of a signed in user", async () => {
    const cookie = await signIn();

    const res = await get("/api/auth/get-session", cookie);

    expect(res.status).toBe(200);
    const body = await json<AuthResponse>(res);
    expect(body.user).toMatchObject({ email: user.email, role: "user", status: "active" });
    expect(body.session).toMatchObject({ userId: body.user.id });
    expect(Object.keys(body.session).sort()).toEqual(
      ["expiresAt", "id", "ipAddress", "userAgent", "userId"].sort(),
    );
  });

  test("returns 401 without a session", async () => {
    const res = await get("/api/auth/get-session");

    expect(res.status).toBe(401);
  });

  test("returns 401 with an invalid session, like protected routes", async () => {
    const cookie = "better-auth.session_token=forged.token";

    expect((await get("/api/auth/get-session", cookie)).status).toBe(401);
    expect((await get("/trpc/privateData", cookie)).status).toBe(401);
  });
});
