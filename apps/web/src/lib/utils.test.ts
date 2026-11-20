import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("laisse un rayon du design system remplacer celui du composant de base", () => {
    expect(cn("rounded-none", "rounded-card rounded-tr-anchor")).toBe(
      "rounded-card rounded-tr-anchor",
    );
  });
});
