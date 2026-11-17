import { vi } from "vitest";

export const CATEGORIES = [
  { id: "c1", name: "Musique", slug: "musique" },
  { id: "c2", name: "Sport", slug: "sport" },
];

type StubEvent = { id: string } & Record<string, unknown>;
type StubOptions = { events?: StubEvent[]; total?: number; status?: number };

export function stubApi({ events = [], total = events.length, status = 200 }: StubOptions = {}) {
  const fetchMock = vi.fn((url: string) => {
    const page = new URL(url, "http://localhost").searchParams.get("page") ?? "1";
    const pageEvents = events.map((event) => ({ ...event, id: `${event.id}-p${page}` }));
    const body = url.includes("/categories") ? CATEGORIES : pageEvents;
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
