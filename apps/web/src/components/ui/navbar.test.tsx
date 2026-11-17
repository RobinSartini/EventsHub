import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { NavBar } from "./navbar";

const LINKS = [
  { to: "/", label: "Explorer" },
  { to: "/favorites", label: "Favoris" },
] as const;

function renderNavBar(user: { name: string } | null, path = "/") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <NavBar links={LINKS} user={user} />
    </MemoryRouter>,
  );
  return screen.getByRole("navigation", { name: "Navigation principale" });
}

describe("NavBar", () => {
  it("marque seulement la rubrique courante avec aria-current page", () => {
    const nav = renderNavBar(null, "/favorites");

    expect(within(nav).getByRole("link", { name: "Favoris" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).getByRole("link", { name: "Explorer" })).not.toHaveAttribute("aria-current");
  });

  it("affiche Se connecter à la place de l'avatar sans session", () => {
    renderNavBar(null);

    expect(screen.getByRole("link", { name: "Se connecter" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("link", { name: "Mon profil" })).not.toBeInTheDocument();
  });

  it("affiche l'avatar vers le profil avec une session", () => {
    renderNavBar({ name: "Corentin Blanc" });

    expect(screen.getByRole("link", { name: "Mon profil" })).toHaveAttribute("href", "/profile");
    expect(screen.queryByRole("link", { name: "Se connecter" })).not.toBeInTheDocument();
  });
});
