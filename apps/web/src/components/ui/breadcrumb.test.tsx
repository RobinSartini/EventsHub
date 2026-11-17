import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { Breadcrumb } from "./breadcrumb";

function renderBreadcrumb() {
  render(
    <MemoryRouter>
      <Breadcrumb
        items={[
          { label: "Explorer", href: "/" },
          { label: "Musique", href: "/?category=music" },
          { label: "Nuit Fluo" },
        ]}
      />
    </MemoryRouter>,
  );
  return screen.getByRole("navigation", { name: "Fil d'Ariane" });
}

describe("Breadcrumb", () => {
  it("marque le dernier élément avec aria-current page, sans lien", () => {
    const nav = renderBreadcrumb();

    expect(within(nav).getByText("Nuit Fluo")).toHaveAttribute("aria-current", "page");
    expect(within(nav).queryByRole("link", { name: "Nuit Fluo" })).not.toBeInTheDocument();
  });

  it("fait pointer les autres éléments vers la bonne adresse", () => {
    const nav = renderBreadcrumb();

    expect(within(nav).getByRole("link", { name: "Explorer" })).toHaveAttribute("href", "/");
    expect(within(nav).getByRole("link", { name: "Musique" })).toHaveAttribute(
      "href",
      "/?category=music",
    );
  });
});
