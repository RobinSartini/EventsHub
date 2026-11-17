import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MusicIcon, SparklesIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { CategoryTabs } from "./category-tabs";

const CATEGORIES = [
  { value: "all", label: "Tout", icon: SparklesIcon },
  { value: "music", label: "Musique", icon: MusicIcon },
] as const;

function renderTabs() {
  const onValueChange = vi.fn();
  render(<CategoryTabs categories={CATEGORIES} value="all" onValueChange={onValueChange} />);
  return { onValueChange };
}

describe("CategoryTabs", () => {
  it("marque seulement la catégorie active comme enfoncée", () => {
    renderTabs();

    expect(screen.getByRole("button", { name: "Tout" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Musique" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("appelle onValueChange avec la catégorie cliquée", async () => {
    const { onValueChange } = renderTabs();

    await userEvent.click(screen.getByRole("button", { name: "Musique" }));

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("music");
  });

  it("ne rappelle pas onValueChange sur la catégorie déjà active", async () => {
    const { onValueChange } = renderTabs();

    await userEvent.click(screen.getByRole("button", { name: "Tout" }));

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
