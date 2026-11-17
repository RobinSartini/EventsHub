import { env } from "@EventsHub/env/web";
import { z } from "zod";

// Champs utiles à l'accueil, d'après le schéma Event de contrat/openapi.yaml.
const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.string(),
  location: z.string().optional(),
  city: z.string().optional(),
  priceCents: z.number().int().optional(),
  status: z.enum(["published", "cancelled"]).optional(),
});

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export type ApiEvent = z.infer<typeof eventSchema>;
type Category = z.infer<typeof categorySchema>;

async function get(path: string, signal?: AbortSignal): Promise<Response> {
  const response = await fetch(`${env.VITE_SERVER_URL}${path}`, { signal });
  if (!response.ok) throw new Error(`GET ${path} a répondu ${response.status}`);
  return response;
}

export async function fetchEvents(query: string, signal?: AbortSignal) {
  const response = await get(`/events?${query}`, signal);
  const events = z.array(eventSchema).parse(await response.json());
  const total = Number.parseInt(response.headers.get("X-Total-Count") ?? "", 10);

  return { events, total: Number.isNaN(total) ? events.length : total };
}

export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const response = await get("/categories", signal);
  return z.array(categorySchema).parse(await response.json());
}
