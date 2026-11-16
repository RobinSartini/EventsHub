import { z } from "zod";

export const listEventsQuery = z
  .object({
    q: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
    city: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(12),
  })
  .refine((query) => !query.from || !query.to || query.from <= query.to, {
    message: "from must be before or equal to to",
    path: ["to"],
  });

export type ListEventsQuery = z.infer<typeof listEventsQuery>;

export type Event = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  organizerId: string;
  startDate: string;
  endDate: string | null;
  location: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number | null;
  status: "published" | "cancelled";
  createdAt: string;
  updatedAt: string;
};
