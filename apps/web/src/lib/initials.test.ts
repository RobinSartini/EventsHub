import { describe, expect, it } from "vitest";

import { initials } from "./initials";

describe("initials", () => {
  it("donne CB pour Camille Bernard", () => {
    expect(initials("Camille Bernard")).toBe("CB");
  });

  it("donne une lettre pour un seul mot", () => {
    expect(initials("Camille")).toBe("C");
  });

  it("garde le premier et le dernier mot d'un nom composé", () => {
    expect(initials("  jean-pierre de la Fontaine ")).toBe("JF");
  });

  it("garde les accents en capitale", () => {
    expect(initials("élodie Ünal")).toBe("ÉÜ");
  });

  it("ne donne rien pour un nom vide", () => {
    expect(initials("   ")).toBe("");
  });
});
