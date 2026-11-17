import { z } from "zod";

export const listEventsQuery = z
  .object({
    q: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((value) => value || undefined),
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

export const eventStatuses = ["published", "cancelled"] as const;

export const listAdminEventsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateEventBody = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().nullable().optional(),
    categoryId: z.string().min(1).nullable().optional(),
    startDate: z.iso.datetime({ offset: true }).optional(),
    endDate: z.iso.datetime({ offset: true }).nullable().optional(),
    location: z.string().trim().min(1).optional(),
    city: z.string().trim().min(1).optional(),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    capacity: z.number().int().min(1).nullable().optional(),
    status: z.enum(eventStatuses).optional(),
    priceCents: z.number().int().min(0).optional(),
    isAccessible: z.boolean().optional(),
    isKidFriendly: z.boolean().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: "Provide at least one field" });

export type ListAdminEventsQuery = z.infer<typeof listAdminEventsQuery>;
export type UpdateEventBody = z.infer<typeof updateEventBody>;

export type AdminEvent = {
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
  status: (typeof eventStatuses)[number];
  priceCents: number;
  isAccessible: boolean;
  isKidFriendly: boolean;
  createdAt: string;
  updatedAt: string;
};
