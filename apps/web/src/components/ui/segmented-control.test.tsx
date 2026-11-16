import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "./segmented-control";

const VIEWS = [
  { value: "list", label: "Liste" },
  { value: "map", label: "Carte" },
] as const;

type View = (typeof VIEWS)[number]["value"];

function renderControl(value: View, onValueChange = vi.fn()) {
  const view = render(
    <SegmentedControl
      label="Affichage"
      options={VIEWS}
      value={value}
      onValueChange={onValueChange}
    />,
  );
  return { ...view, onValueChange };
}

describe("SegmentedControl", () => {
  it("se trouve par son nom : Affichage", () => {
    renderControl("list");

    expect(screen.getByRole("group", { name: "Affichage" })).toBeInTheDocument();
  });

  it("affiche Liste choisie au départ", () => {
    renderControl("list");

    expect(screen.getByRole("button", { name: "Liste" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Carte" })).toHaveAttribute("aria-pressed", "false");
  });

  it("appelle onValueChange avec map au clic sur Carte", async () => {
    const { onValueChange } = renderControl("list");

    await userEvent.click(screen.getByRole("button", { name: "Carte" }));

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("map");
  });

  it("n'a jamais qu'une option choisie à la fois", () => {
    const { rerender } = renderControl("list");

    rerender(
      <SegmentedControl label="Affichage" options={VIEWS} value="map" onValueChange={vi.fn()} />,
    );

    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(1);
    expect(screen.getByRole("button", { pressed: true })).toHaveAccessibleName("Carte");
  });

  it("ne rappelle pas onValueChange au clic sur l'option déjà choisie", async () => {
    const { onValueChange } = renderControl("list");

    await userEvent.click(screen.getByRole("button", { name: "Liste" }));

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
