import { describe, expect, it } from "vitest";

import { formatDateBadge, formatDayLabel, formatTime, fromIsoDay, toIsoDay } from "./format-date";

describe("formatDateBadge", () => {
  it("affiche le jour, la date et le mois en capitales", () => {
    expect(formatDateBadge("2026-11-14T21:00:00Z")).toBe("SAM 14 NOV");
  });

  it("utilise l'heure de Paris : 23h30 UTC tombe le lendemain", () => {
    expect(formatDateBadge("2026-11-14T23:30:00Z")).toBe("DIM 15 NOV");
  });

  it("garde les accents des mois", () => {
    expect(formatDateBadge("2026-12-05T10:00:00Z")).toBe("SAM 5 DÉC");
  });
});

describe("toIsoDay", () => {
  it("donne le jour au format du contrat, sans décalage de fuseau", () => {
    expect(toIsoDay(new Date(2026, 11, 5))).toBe("2026-12-05");
  });
});

describe("fromIsoDay", () => {
  it("relit le jour du contrat comme une date locale", () => {
    expect(fromIsoDay("2026-12-05")).toEqual(new Date(2026, 11, 5));
  });

  it("ignore une valeur absente ou invalide", () => {
    expect(fromIsoDay(undefined)).toBeUndefined();
    expect(fromIsoDay("pas une date")).toBeUndefined();
  });

  it("refuse un jour qui n'existe pas au lieu de le reporter au mois suivant", () => {
    expect(fromIsoDay("2026-02-31")).toBeUndefined();
    expect(fromIsoDay("2026-13-01")).toBeUndefined();
  });
});

describe("formatDayLabel", () => {
  it("affiche le jour choisi en court", () => {
    expect(formatDayLabel(new Date(2026, 11, 5))).toBe("sam. 5 déc.");
  });
});

describe("formatTime", () => {
  it("affiche l'heure de Paris pour une date UTC du contrat", () => {
    expect(formatTime("2026-11-14T20:00:00Z")).toBe("21:00");
  });

  it("suit l'heure d'été", () => {
    expect(formatTime("2026-07-14T19:30:00Z")).toBe("21:30");
  });
});
