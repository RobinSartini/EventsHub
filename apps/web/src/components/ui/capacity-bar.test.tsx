import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CapacityBar } from "./capacity-bar";

describe("CapacityBar", () => {
  it("affiche la phrase des places restantes", () => {
    render(<CapacityBar taken={62} capacity={80} />);

    expect(screen.getByText("Plus que 18 places")).toBeInTheDocument();
  });

  it("n'affiche rien sans capacité", () => {
    const { container } = render(<CapacityBar taken={12} capacity={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("annonce sa valeur, son maximum et sa phrase", () => {
    render(<CapacityBar taken={34} capacity={60} />);

    const bar = screen.getByRole("progressbar", { name: "Places réservées" });
    expect(bar).toHaveAttribute("aria-valuenow", "34");
    expect(bar).toHaveAttribute("aria-valuemax", "60");
    expect(bar).toHaveAttribute("aria-valuetext", "26 places disponibles");
  });

  it("ne dépasse pas le maximum en cas de surréservation", () => {
    render(<CapacityBar taken={85} capacity={80} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "80");
    expect(screen.getByText("Complet")).toBeInTheDocument();
  });
});
