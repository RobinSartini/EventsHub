import type { auth } from "@EventsHub/auth";

import type { User } from "./users";

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

export type Session = {
  id: string;
  userId: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
};

export type AuthResponse = {
  user: User;
  session: Session;
};

export type SignOutResponse = {
  success: boolean;
};

export type RefreshResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};
