import { auth } from "@EventsHub/auth";

import app from "@/index";

const origin = process.env.CORS_ORIGIN ?? "http://localhost:3001";

export const user = { name: "Ada", email: "ada@example.com", password: "password123" };

export function post(path: string, body: unknown, cookie = "") {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, Cookie: cookie },
    body: JSON.stringify(body),
  });
}

export function patch(path: string, body: unknown, cookie = "") {
  return app.request(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Origin: origin, Cookie: cookie },
    body: JSON.stringify(body),
  });
}

export function del(path: string, cookie = "") {
  return app.request(path, { method: "DELETE", headers: { Origin: origin, Cookie: cookie } });
}

export function get(path: string, cookie = "") {
  return app.request(path, { headers: { Origin: origin, Cookie: cookie } });
}

export async function json<T>(res: Response) {
  return (await res.json()) as T;
}

export function cookieOf(res: Response) {
  return res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
}

export async function signUp(account = user) {
  return post("/api/auth/sign-up/email", account);
}

export async function signIn(account = user) {
  await signUp(account);
  const res = await post("/api/auth/sign-in/email", {
    email: account.email,
    password: account.password,
  });
  return cookieOf(res);
}

export async function setUserFields(email: string, fields: { role?: string; status?: string }) {
  const { internalAdapter } = await auth.$context;
  const found = await internalAdapter.findUserByEmail(email);
  await internalAdapter.updateUser(found!.user.id, fields);
  return found!.user.id;
}

export async function signInAs(role: "user" | "admin") {
  const account = { ...user, email: `${role}-${crypto.randomUUID()}@example.com` };
  await signUp(account);
  const id = await setUserFields(account.email, { role });
  const res = await post("/api/auth/sign-in/email", {
    email: account.email,
    password: account.password,
  });
  return { id, cookie: cookieOf(res) };
}
