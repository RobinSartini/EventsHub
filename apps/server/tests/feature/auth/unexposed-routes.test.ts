import { describe, expect, test } from "vitest";

import { get, post, signIn } from "@tests/helpers";

describe("better-auth routes outside the contract", () => {
  test("update-user is not exposed, even when signed in", async () => {
    const cookie = await signIn();

    expect(cookie).toBeTruthy();
    const res = await post("/api/auth/update-user", { name: "" }, cookie);

    expect(res.status).toBe(404);
  });

  test.each(["/api/auth/change-email", "/api/auth/delete-user", "/api/auth/list-sessions"])(
    "%s is not exposed",
    async (path) => {
      const res = path.endsWith("list-sessions") ? await get(path) : await post(path, {});

      expect(res.status).toBe(404);
    },
  );

  test("jwks stays public", async () => {
    const cookie = await signIn();
    expect((await post("/api/auth/refresh", {}, cookie)).status).toBe(200);

    const res = await get("/api/auth/jwks");

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ keys: [expect.objectContaining({ alg: "EdDSA" })] });
  });
});
