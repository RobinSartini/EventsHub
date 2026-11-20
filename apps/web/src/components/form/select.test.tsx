import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./select";

const SORTS = [
  { value: "date", label: "Date" },
  { value: "distance", label: "Distance" },
  { value: "price", label: "Prix" },
] as const;

function renderSelect() {
  const onValueChange = vi.fn();
  render(<Select label="Trier par" options={SORTS} value="date" onValueChange={onValueChange} />);
  return { onValueChange, trigger: screen.getByRole("combobox", { name: "Trier par" }) };
}

function expectHighlighted(name: string) {
  return waitFor(() =>
    expect(screen.getByRole("option", { name })).toHaveAttribute("data-highlighted"),
  );
}

describe("Select", () => {
  it("se trouve par son libellé et affiche la valeur choisie", () => {
    const { trigger } = renderSelect();

    expect(trigger).toHaveTextContent("Date");
  });

  it("appelle onValueChange avec la valeur de Distance", async () => {
    const { trigger, onValueChange } = renderSelect();

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("option", { name: "Distance" }));

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("distance");
  });

  it("s'ouvre au clavier et choisit une option avec les flèches", async () => {
    const { trigger, onValueChange } = renderSelect();

    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await expectHighlighted("Date");
    await userEvent.keyboard("{ArrowDown}");
    await expectHighlighted("Distance");
    await userEvent.keyboard("{Enter}");

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("distance");
  });
});
