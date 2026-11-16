import { memoryAdapter } from "better-auth/adapters/memory";
import { vi } from "vitest";

const authPrismaAdapter = await vi.hoisted(async () => {
  const { createRequire } = await import("node:module");
  return createRequire(import.meta.resolve("@EventsHub/auth")).resolve(
    "better-auth/adapters/prisma",
  );
});

vi.mock("@EventsHub/db", () => ({ default: {} }));
vi.mock(authPrismaAdapter, () => ({
  prismaAdapter: () => memoryAdapter({ user: [], session: [], account: [], verification: [] }),
}));
