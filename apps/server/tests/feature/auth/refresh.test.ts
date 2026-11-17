import { ACCESS_TOKEN_TTL_SECONDS, auth } from "@EventsHub/auth";
import { describe, expect, test } from "vitest";

import type { RefreshResponse } from "../../../src/types/auth";

import { json, post, signIn } from "../../helpers";

describe("POST /api/auth/refresh", () => {
  test("a signed in user gets a short lived access token", async () => {
    const cookie = await signIn();

    const res = await post("/api/auth/refresh", {}, cookie);

    expect(res.status).toBe(200);
    const data = await json<RefreshResponse>(res);
    expect(data).toMatchObject({ tokenType: "Bearer", expiresIn: ACCESS_TOKEN_TTL_SECONDS });

    const { payload } = await auth.api.verifyJWT({ body: { token: data.accessToken } });
    expect(payload?.email).toBe("ada@example.com");
    expect(Number(payload?.exp) - Number(payload?.iat)).toBe(ACCESS_TOKEN_TTL_SECONDS);
  });

  test("each refresh issues a new valid access token", async () => {
    const cookie = await signIn();

    const first = await json<RefreshResponse>(await post("/api/auth/refresh", {}, cookie));
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const second = await json<RefreshResponse>(await post("/api/auth/refresh", {}, cookie));

    expect(second.accessToken).not.toBe(first.accessToken);
    const { payload } = await auth.api.verifyJWT({ body: { token: second.accessToken } });
    expect(payload).not.toBeNull();
  });

  test("refreshing without a session is rejected with 401", async () => {
    const res = await post("/api/auth/refresh", {});

    expect(res.status).toBe(401);
  });

  test("refreshing after sign-out is rejected with 401", async () => {
    const cookie = await signIn();
    await post("/api/auth/sign-out", {}, cookie);

    const res = await post("/api/auth/refresh", {}, cookie);

    expect(res.status).toBe(401);
  });
});
