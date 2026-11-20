import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SearchBar, type SearchValues } from "./search-bar";

function renderSearchBar(defaultValues?: SearchValues) {
  const onSearch = vi.fn();
  render(<SearchBar defaultValues={defaultValues} onSearch={onSearch} />);
  return { onSearch };
}

describe("SearchBar", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 16));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("trouve chaque champ par son étiquette : Quoi, Où, Quand", () => {
    renderSearchBar();

    expect(screen.getByLabelText("Quoi")).toBeInTheDocument();
    expect(screen.getByLabelText("Où")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quand Choisir une date" })).toBeInTheDocument();
  });

  it("appelle onSearch avec { q: 'concert' } après avoir tapé concert puis Entrée", async () => {
    const { onSearch } = renderSearchBar();

    await userEvent.type(screen.getByLabelText("Quoi"), "concert{Enter}");

    expect(onSearch).toHaveBeenCalledExactlyOnceWith({ q: "concert" });
  });

  it("n'envoie ni les champs vides ni les espaces autour du texte", async () => {
    const { onSearch } = renderSearchBar();

    await userEvent.type(screen.getByLabelText("Où"), "  Lyon  ");
    await userEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    expect(onSearch).toHaveBeenCalledExactlyOnceWith({ city: "Lyon" });
  });

  it("préremplit les champs avec defaultValues", () => {
    renderSearchBar({ q: "jazz", city: "Lyon" });

    expect(screen.getByLabelText("Quoi")).toHaveValue("jazz");
    expect(screen.getByLabelText("Où")).toHaveValue("Lyon");
  });

  it("choisit une date dans le calendrier et l'envoie au format du contrat", async () => {
    const { onSearch } = renderSearchBar();

    await userEvent.click(screen.getByRole("button", { name: /Quand/ }));
    await userEvent.click(await screen.findByRole("button", { name: /5 décembre 2026/ }));
    await userEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    expect(screen.getByRole("button", { name: /Quand/ })).toHaveTextContent("sam. 5 déc.");
    expect(onSearch).toHaveBeenCalledExactlyOnceWith({ from: "2026-12-05" });
  });

  it("choisit une période et l'affiche du premier au dernier jour", async () => {
    const { onSearch } = renderSearchBar();

    await userEvent.click(screen.getByRole("button", { name: /Quand/ }));
    await userEvent.click(await screen.findByRole("button", { name: /5 décembre 2026/ }));
    await userEvent.click(screen.getByRole("button", { name: /6 décembre 2026/ }));
    await userEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    expect(screen.getByRole("button", { name: /Quand/ })).toHaveTextContent("5 déc. - 6 déc.");
    expect(onSearch).toHaveBeenCalledExactlyOnceWith({ from: "2026-12-05", to: "2026-12-06" });
  });

  it("grise les jours passés", async () => {
    renderSearchBar();

    await userEvent.click(screen.getByRole("button", { name: /Quand/ }));

    expect(await screen.findByRole("button", { name: /10 novembre 2026/ })).toBeDisabled();
  });

  it.each([
    ["Quoi", "Effacer la recherche"],
    ["Où", "Effacer la ville"],
  ])("vide le champ %s, y remet le focus et ne lance pas la recherche", async (label, clear) => {
    const { onSearch } = renderSearchBar({ q: "jazz", city: "Lyon" });

    await userEvent.click(screen.getByRole("button", { name: clear }));

    expect(screen.getByLabelText(label)).toHaveValue("");
    expect(screen.getByLabelText(label)).toHaveFocus();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("efface la date choisie", async () => {
    const { onSearch } = renderSearchBar({ from: "2026-12-05" });

    await userEvent.click(screen.getByRole("button", { name: /Quand/ }));
    await userEvent.click(await screen.findByRole("button", { name: "Effacer la date" }));
    await userEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    expect(onSearch).toHaveBeenCalledExactlyOnceWith({});
  });
});
