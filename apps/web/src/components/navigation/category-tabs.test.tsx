import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MusicIcon, SparklesIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { CategoryTabs } from "./category-tabs";

const CATEGORIES = [
  { value: "all", label: "Tout", icon: SparklesIcon },
  { value: "music", label: "Musique", icon: MusicIcon },
];

function renderTabs() {
  const onValueChange = vi.fn();
  render(<CategoryTabs categories={CATEGORIES} value="all" onValueChange={onValueChange} />);
  return { onValueChange };
}

describe("CategoryTabs", () => {
  it("coche seulement la catégorie active", () => {
    renderTabs();

    expect(screen.getByRole("radio", { name: "Tout" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Musique" })).not.toBeChecked();
  });

  it("appelle onValueChange avec la catégorie cliquée", async () => {
    const { onValueChange } = renderTabs();

    await userEvent.click(screen.getByRole("radio", { name: "Musique" }));

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("music");
  });

  it("ne rappelle pas onValueChange sur la catégorie déjà active", async () => {
    const { onValueChange } = renderTabs();

    await userEvent.click(screen.getByRole("radio", { name: "Tout" }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("passe à la catégorie suivante avec la flèche droite", async () => {
    const { onValueChange } = renderTabs();

    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("music");
  });
});
