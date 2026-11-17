import prisma from "@EventsHub/db";
import { z } from "zod";

import { ApiError } from "../../../utils/api-response";

export const eventSelect = {
  id: true,
  name: true,
  description: true,
  categoryId: true,
  organizerId: true,
  startDate: true,
  endDate: true,
  location: true,
  city: true,
  latitude: true,
  longitude: true,
  capacity: true,
  status: true,
  priceCents: true,
  isAccessible: true,
  isKidFriendly: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function invalid(message: string, error: z.ZodError) {
  const { formErrors, fieldErrors } = z.flattenError(error);
  return new ApiError(400, message, { formErrors, fieldErrors });
}

export async function findEventOr404(id: string) {
  const existing = await prisma.event.findUnique({
    where: { id },
    select: { id: true, startDate: true, endDate: true },
  });
  if (!existing) {
    throw new ApiError(404, "Event not found");
  }
  return existing;
}
