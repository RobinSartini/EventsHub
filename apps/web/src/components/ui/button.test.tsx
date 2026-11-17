import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FormEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("prend son libellé comme nom", () => {
    render(<Button>Réserver</Button>);

    expect(screen.getByRole("button", { name: "Réserver" })).toBeInTheDocument();
  });

  it("appelle onClick au clic", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Réserver</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Réserver" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("n'appelle plus rien quand il est désactivé", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Réserver
      </Button>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Réserver" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("envoie le formulaire avec type submit", async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Rechercher</Button>
      </form>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
