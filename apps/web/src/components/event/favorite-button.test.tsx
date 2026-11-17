import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { FavoriteButton } from "./favorite-button";

function SavedFavorite({ onToggle }: Readonly<{ onToggle: () => void }>) {
  const [isFavorite, setIsFavorite] = useState(false);
  return (
    <FavoriteButton
      eventName="Nuit Fluo"
      isFavorite={isFavorite}
      onToggle={() => {
        onToggle();
        setIsFavorite((current) => !current);
      }}
    />
  );
}

function SavingFavorite({ onToggle }: Readonly<{ onToggle: () => void }>) {
  const [isPending, setIsPending] = useState(false);
  return (
    <FavoriteButton
      eventName="Nuit Fluo"
      isFavorite={false}
      isPending={isPending}
      onToggle={() => {
        onToggle();
        setIsPending(true);
      }}
    />
  );
}

describe("FavoriteButton", () => {
  it("passe aria-pressed de false à true au clic", async () => {
    render(<SavedFavorite onToggle={vi.fn()} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("change de nom : Ajouter devient Retirer", async () => {
    render(<SavedFavorite onToggle={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Ajouter Nuit Fluo aux favoris" }));

    expect(
      screen.getByRole("button", { name: "Retirer Nuit Fluo des favoris" }),
    ).toBeInTheDocument();
  });

  it("appelle onToggle une fois par clic", async () => {
    const onToggle = vi.fn();
    render(<SavedFavorite onToggle={onToggle} />);

    await userEvent.click(screen.getByRole("button"));

    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("n'appelle onToggle qu'une fois sur un double clic rapide pendant l'enregistrement", async () => {
    const onToggle = vi.fn();
    render(<SavingFavorite onToggle={onToggle} />);

    await userEvent.dblClick(screen.getByRole("button"));

    expect(onToggle).toHaveBeenCalledOnce();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });
});
