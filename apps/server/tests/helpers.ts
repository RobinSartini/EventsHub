import app from "../src/index";

const origin = process.env.CORS_ORIGIN ?? "http://localhost:3001";

export const user = { name: "Ada", email: "ada@example.com", password: "password123" };

export function post(path: string, body: unknown, cookie = "") {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, Cookie: cookie },
    body: JSON.stringify(body),
  });
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
