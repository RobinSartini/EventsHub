import { describe, expect, it } from "vitest";

import { eventsQuery, nextPage, readHomeSearch, TONIGHT, writeHomeSearch } from "./home-search";

const read = (search: string) => readHomeSearch(new URLSearchParams(search));
const today = new Date(2026, 10, 17);

describe("readHomeSearch", () => {
  it("lit la recherche, la ville, la date et la catégorie", () => {
    expect(read("q=jazz&city=Lyon&from=2026-12-05&category=musique")).toEqual({
      q: "jazz",
      city: "Lyon",
      from: "2026-12-05",
      category: "musique",
    });
  });

  it("ignore les champs vides et coupe à 100 caractères comme le contrat", () => {
    const search = read(`q=%20%20&city=${"a".repeat(150)}`);

    expect(search.q).toBeUndefined();
    expect(search.city).toHaveLength(100);
  });

  it("ignore une date mal formée", () => {
    expect(read("from=2026-02-31").from).toBeUndefined();
  });
});

describe("writeHomeSearch", () => {
  it("n'écrit que les champs remplis", () => {
    expect(writeHomeSearch({ q: "jazz", city: undefined }).toString()).toBe("q=jazz");
  });
});

describe("eventsQuery", () => {
  it("transmet les filtres et demande 12 événements par page", () => {
    const query = eventsQuery(read("q=jazz&city=Lyon&from=2026-12-05&category=musique"), today, 2);

    expect(query).toBe("q=jazz&city=Lyon&from=2026-12-05&category=musique&page=2&pageSize=12");
  });

  it("traduit « Ce soir » en événements du jour, à la place de la date choisie", () => {
    const query = new URLSearchParams(
      eventsQuery(read(`from=2026-12-05&category=${TONIGHT}`), today, 1),
    );

    expect(query.get("from")).toBe("2026-11-17");
    expect(query.get("to")).toBe("2026-11-17");
    expect(query.has("category")).toBe(false);
  });
});

describe("nextPage", () => {
  const page = (count: number, total: number) => ({ events: Array.from({ length: count }), total });

  it("demande la page suivante tant qu'il reste des événements", () => {
    expect(nextPage([page(12, 30), page(12, 30)])).toBe(3);
  });

  it("s'arrête quand tout est chargé", () => {
    expect(nextPage([page(12, 30), page(12, 30), page(6, 30)])).toBeUndefined();
  });

  it("s'arrête sur une page vide, même si le total annonce plus", () => {
    expect(nextPage([page(12, 30), page(0, 30)])).toBeUndefined();
  });
});
