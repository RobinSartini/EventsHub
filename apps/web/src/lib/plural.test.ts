import { describe, expect, it } from "vitest";

import { plural } from "./plural";

describe("plural", () => {
  it("garde le singulier pour 0 et 1, comme en français", () => {
    expect(plural(0, "place")).toBe("place");
    expect(plural(1, "place")).toBe("place");
  });

  it("ajoute un s à partir de 2", () => {
    expect(plural(2, "billet")).toBe("billets");
  });
});
