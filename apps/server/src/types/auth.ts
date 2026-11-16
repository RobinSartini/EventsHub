import type { auth } from "@EventsHub/auth";

import { z } from "zod";

export const signUpBody = z.object({
  name: z.string().trim().min(2),
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const signInBody = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type SignUpBody = z.infer<typeof signUpBody>;
export type SignInBody = z.infer<typeof signInBody>;

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = AuthSession["user"];

export type SignUpResponse = {
  token: string | null;
  user: AuthUser;
};

export type SignInResponse = {
  redirect: boolean;
  token: string;
  url?: string;
  user: AuthUser;
};

export type SignOutResponse = {
  success: boolean;
};

export type GetSessionResponse = AuthSession | null;
