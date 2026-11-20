import { describe, expect, it } from "vitest";

import { formatDistance } from "./format-distance";

describe("formatDistance", () => {
  it("garde une décimale sous 10 km", () => {
    expect(formatDistance(1.234)).toMatch(/^1,2\skm$/);
  });

  it("arrondit au kilomètre au-delà", () => {
    expect(formatDistance(12.6)).toMatch(/^13\skm$/);
  });
});
