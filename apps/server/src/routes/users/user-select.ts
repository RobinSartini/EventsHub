import { z } from "zod";

import { ApiError } from "../../utils/api-response";

export const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function invalid(message: string, error: z.ZodError) {
  const { formErrors, fieldErrors } = z.flattenError(error);
  return new ApiError(400, message, { formErrors, fieldErrors });
}
