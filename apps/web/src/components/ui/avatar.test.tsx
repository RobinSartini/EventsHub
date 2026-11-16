import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("affiche les initiales du nom", () => {
    render(<Avatar name="Camille Bernard" />);

    expect(screen.getByText("CB")).toBeInTheDocument();
  });

  it("n'affiche rien pour un nom vide", () => {
    const { container } = render(<Avatar name="  " />);

    expect(container).toBeEmptyDOMElement();
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
