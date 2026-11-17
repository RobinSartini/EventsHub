import { vi } from "vitest";

// Faux serveur pour les tests de l'accueil : GET /categories et GET /events (avec X-Total-Count).
export const CATEGORIES = [
  { id: "c1", name: "Musique", slug: "musique" },
  { id: "c2", name: "Sport", slug: "sport" },
];

type StubOptions = { events?: unknown[]; total?: number; status?: number };

export function stubApi({ events = [], total = events.length, status = 200 }: StubOptions = {}) {
  const fetchMock = vi.fn((url: string) => {
    const body = url.includes("/categories") ? CATEGORIES : events;
    return Promise.resolve(
      new Response(JSON.stringify(body), { status, headers: { "X-Total-Count": String(total) } }),
    );
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export function lastEventsUrl(fetchMock: ReturnType<typeof stubApi>) {
  const urls = fetchMock.mock.calls.map(([url]) => url);
  return urls.filter((url) => url.includes("/events")).at(-1);
}
