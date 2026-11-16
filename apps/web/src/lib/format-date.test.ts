import { describe, expect, it } from "vitest";

import { formatDateBadge } from "./format-date";

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
