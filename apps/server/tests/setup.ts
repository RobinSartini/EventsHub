import { memoryAdapter } from "better-auth/adapters/memory";
import { vi } from "vitest";

const authPrismaAdapter = await vi.hoisted(async () => {
  const { createRequire } = await import("node:module");
  return createRequire(import.meta.resolve("@EventsHub/auth")).resolve(
    "better-auth/adapters/prisma",
  );
});

vi.mock("@EventsHub/db", () => ({
  default: {
    event: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    category: { findUnique: vi.fn() },
    user: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    session: { deleteMany: vi.fn() },
  },
}));
vi.mock(authPrismaAdapter, () => ({
  prismaAdapter: () =>
    memoryAdapter({ user: [], session: [], account: [], verification: [], jwks: [] }),
}));
