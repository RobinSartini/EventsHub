import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DateBadge } from "./date-badge";

describe("DateBadge", () => {
  it("garde la date complète pour les lecteurs d'écran et les moteurs", () => {
    render(<DateBadge date="2026-11-14T21:00:00Z" />);

    expect(screen.getByText("SAM 14 NOV")).toHaveAttribute("datetime", "2026-11-14T21:00:00Z");
  });
});
