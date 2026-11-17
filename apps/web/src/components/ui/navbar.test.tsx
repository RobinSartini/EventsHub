import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { NavBar } from "./navbar";

const LINKS = [
  { to: "/", label: "Explorer" },
  { to: "/favorites", label: "Favoris" },
] as const;

function renderNavBar(user: { name: string } | null, path = "/") {
  const onSignOut = vi.fn();
  render(
    <MemoryRouter initialEntries={[path]}>
      <NavBar links={LINKS} user={user} onSignOut={onSignOut} />
    </MemoryRouter>,
  );
  return { onSignOut, nav: screen.getByRole("navigation", { name: "Navigation principale" }) };
}

async function openMenu() {
  await userEvent.click(screen.getByRole("button", { name: "Menu" }));
  return screen.findByRole("menu");
}

describe("NavBar", () => {
  it("marque seulement la rubrique courante avec aria-current page", () => {
    const { nav } = renderNavBar(null, "/favorites");

    expect(within(nav).getByRole("link", { name: "Favoris" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).getByRole("link", { name: "Explorer" })).not.toHaveAttribute("aria-current");
  });

  it("mène à la connexion depuis la pilule sans session", () => {
    renderNavBar(null);

    expect(screen.getByRole("link", { name: "Se connecter" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("link", { name: "Mon profil" })).not.toBeInTheDocument();
  });

  it("mène au profil depuis la pilule avec une session", () => {
    renderNavBar({ name: "Corentin Blanc" });

    expect(screen.getByRole("link", { name: "Mon profil" })).toHaveAttribute("href", "/profile");
    expect(screen.queryByRole("link", { name: "Se connecter" })).not.toBeInTheDocument();
  });

  it("ouvre un menu avec les rubriques et la connexion sans session", async () => {
    renderNavBar(null);

    const menu = await openMenu();

    expect(within(menu).getByRole("menuitem", { name: "Favoris" })).toHaveAttribute(
      "href",
      "/favorites",
    );
    expect(within(menu).getByRole("menuitem", { name: "Se connecter" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("déconnecte depuis le menu avec une session", async () => {
    const { onSignOut } = renderNavBar({ name: "Corentin Blanc" });

    const menu = await openMenu();
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Se déconnecter" }));

    expect(onSignOut).toHaveBeenCalledOnce();
  });
});
