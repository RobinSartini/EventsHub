import { describe, expect, it } from "vitest";

import { formatPrice } from "./format-price";

const withPlainSpaces = (text: string) => text.replaceAll(/\s/g, " ");

describe("formatPrice", () => {
  it("affiche un prix rond sans centimes", () => {
    expect(withPlainSpaces(formatPrice(24))).toBe("24 €");
  });

  it("affiche les centimes avec une virgule", () => {
    expect(withPlainSpaces(formatPrice(12.5))).toBe("12,50 €");
  });

  it("affiche Gratuit pour un billet sans prix", () => {
    expect(formatPrice(null)).toBe("Gratuit");
    expect(formatPrice(0)).toBe("Gratuit");
  });
});
