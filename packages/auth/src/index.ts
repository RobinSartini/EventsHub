import prisma from "@EventsHub/db";
import { env } from "@EventsHub/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { jwt } from "better-auth/plugins/jwt";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: { type: "string", input: false, defaultValue: "user" },
      status: { type: "string", input: false, defaultValue: "active" },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session, ctx) => {
          const user = await ctx?.context.internalAdapter.findUserById(session.userId);
          if (user && "status" in user && user.status === "suspended") {
            throw new APIError("FORBIDDEN", { message: "Account suspended" });
          }
        },
      },
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [jwt({ jwt: { expirationTime: `${ACCESS_TOKEN_TTL_SECONDS}s` } })],
});
