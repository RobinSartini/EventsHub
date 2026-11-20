import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("garde le lien vers le profil quand le nom est vide", () => {
    render(
      <MemoryRouter>
        <Avatar name="  " href="/profile" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Mon profil" })).toHaveAttribute("href", "/profile");
  });

  it("s'appelle Mon profil et mène au profil quand c'est un lien", () => {
    render(
      <MemoryRouter>
        <Avatar name="Camille Bernard" href="/profile" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Mon profil" })).toHaveAttribute("href", "/profile");
  });
});
