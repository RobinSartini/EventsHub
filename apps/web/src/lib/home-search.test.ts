import { describe, expect, it } from "vitest";

import { eventsQuery, readHomeSearch, TONIGHT, writeHomeSearch } from "./home-search";

const read = (search: string) => readHomeSearch(new URLSearchParams(search));
const today = new Date(2026, 10, 17);

describe("readHomeSearch", () => {
  it("lit la recherche, la ville, la date, la catégorie et la page", () => {
    expect(read("q=jazz&city=Lyon&from=2026-12-05&category=musique&page=3")).toEqual({
      q: "jazz",
      city: "Lyon",
      from: "2026-12-05",
      category: "musique",
      page: 3,
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

  it.each(["0", "-2", "1.5", "abc", ""])("revient à la page 1 pour page=%s", (page) => {
    expect(read(`page=${page}`).page).toBe(1);
  });
});

describe("writeHomeSearch", () => {
  it("n'écrit que les champs remplis et omet la page 1", () => {
    expect(writeHomeSearch({ q: "jazz", city: undefined, page: 1 }).toString()).toBe("q=jazz");
  });

  it("garde la page au-delà de la première", () => {
    expect(writeHomeSearch({ category: "sport", page: 2 }).toString()).toBe(
      "category=sport&page=2",
    );
  });
});

describe("eventsQuery", () => {
  it("transmet les filtres et demande 12 événements par page", () => {
    const query = eventsQuery(read("q=jazz&city=Lyon&from=2026-12-05&category=musique"), today);

    expect(query).toBe("q=jazz&city=Lyon&from=2026-12-05&category=musique&page=1&pageSize=12");
  });

  it("traduit « Ce soir » en événements du jour, à la place de la date choisie", () => {
    const query = new URLSearchParams(
      eventsQuery(read(`from=2026-12-05&category=${TONIGHT}`), today),
    );

    expect(query.get("from")).toBe("2026-11-17");
    expect(query.get("to")).toBe("2026-11-17");
    expect(query.has("category")).toBe(false);
  });
});
