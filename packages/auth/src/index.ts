import prisma from "@EventsHub/db";
import { env } from "@EventsHub/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
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
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [jwt({ jwt: { expirationTime: `${ACCESS_TOKEN_TTL_SECONDS}s` } })],
});
