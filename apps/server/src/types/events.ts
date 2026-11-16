import { z } from "zod";

export const listEventsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export type ListEventsQuery = z.infer<typeof listEventsQuery>;

export type EventListItem = {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string;
  city: string;
  priceCents: number;
  capacity: number | null;
  isAccessible: boolean;
  isKidFriendly: boolean;
  category: { name: string; slug: string } | null;
};

export type EventListResponse = {
  items: EventListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
