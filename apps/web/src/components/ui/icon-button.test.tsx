import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Share2Icon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./icon-button";

function renderShare(onClick = vi.fn()) {
  render(
    <IconButton aria-label="Partager l'événement" onClick={onClick}>
      <Share2Icon />
    </IconButton>,
  );
  return { onClick, button: screen.getByRole("button", { name: "Partager l'événement" }) };
}

describe("IconButton", () => {
  it("se trouve par son nom : Partager l'événement", () => {
    const { button } = renderShare();

    expect(button).toBeInTheDocument();
  });

  it("cache l'icône aux lecteurs d'écran", () => {
    const { button } = renderShare();

    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("appelle onClick au clic", async () => {
    const { button, onClick } = renderShare();

    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("ne soumet pas le formulaire qui le contient", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const form = document.createElement("form");
    form.addEventListener("submit", onSubmit);
    document.body.append(form);
    render(<IconButton aria-label="Partager l'événement" />, { container: form });

    await userEvent.click(screen.getByRole("button", { name: "Partager l'événement" }));

    expect(onSubmit).not.toHaveBeenCalled();
    form.remove();
  });
});
