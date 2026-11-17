import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LiveBadge } from "./live-badge";

describe("LiveBadge", () => {
  it("cache le point animé aux lecteurs d'écran", () => {
    const { container } = render(<LiveBadge />);

    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });
});
