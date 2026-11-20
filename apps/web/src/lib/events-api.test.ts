import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchCategories, fetchEvents } from "./events-api";

const CONCERT = {
  id: "evt_1",
  name: "Concert Jazz",
  organizerId: "o1",
  startDate: "2026-12-01T20:00:00Z",
  location: "Le Cargo",
  city: "Valence",
  priceCents: 1200,
};

function stubFetch(body: unknown, init?: ResponseInit) {
  const fetchMock = vi.fn((_url: string) =>
    Promise.resolve(new Response(JSON.stringify(body), init)),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchEvents", () => {
  it("appelle GET /events avec la requête et lit le total dans X-Total-Count", async () => {
    const fetchMock = stubFetch([CONCERT], { headers: { "X-Total-Count": "27" } });

    const result = await fetchEvents("city=Valence&page=2");

    expect(fetchMock.mock.calls[0]?.[0]).toMatch(/\/events\?city=Valence&page=2$/);
    expect(result).toEqual({
      events: [expect.objectContaining({ name: "Concert Jazz" })],
      total: 27,
    });
  });

  it("compte les événements reçus quand l'en-tête manque", async () => {
    stubFetch([CONCERT, { ...CONCERT, id: "evt_2" }]);

    expect((await fetchEvents("")).total).toBe(2);
  });

  it("échoue quand le serveur répond une erreur", async () => {
    stubFetch({ error: "boom" }, { status: 500 });

    await expect(fetchEvents("")).rejects.toThrow("500");
  });

  it("refuse une réponse qui ne suit pas le contrat", async () => {
    stubFetch([{ id: "evt_1" }]);

    await expect(fetchEvents("")).rejects.toThrow();
  });
});

describe("fetchCategories", () => {
  it("renvoie les catégories de GET /categories", async () => {
    const fetchMock = stubFetch([{ id: "c1", name: "Musique", slug: "musique" }]);

    await expect(fetchCategories()).resolves.toEqual([
      { id: "c1", name: "Musique", slug: "musique" },
    ]);
    expect(fetchMock.mock.calls[0]?.[0]).toMatch(/\/categories$/);
  });
});
