import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CheckboxField, CheckboxGroup } from "./checkbox";

function renderField({ checked = false, count }: { checked?: boolean; count?: number } = {}) {
  const onCheckedChange = vi.fn();
  render(
    <CheckboxField
      label="Musique"
      count={count}
      checked={checked}
      onCheckedChange={onCheckedChange}
    />,
  );
  return { onCheckedChange, box: screen.getByRole("checkbox", { name: "Musique" }) };
}

describe("CheckboxField", () => {
  it("affiche Musique cochée au départ", () => {
    const { box } = renderField({ checked: true });

    expect(box).toBeChecked();
  });

  it("coche la case au clic sur le libellé", async () => {
    const { onCheckedChange } = renderField();

    await userEvent.click(screen.getByText("Musique"));

    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("décoche la case au clic quand elle est cochée", async () => {
    const { box, onCheckedChange } = renderField({ checked: true });

    await userEvent.click(box);

    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("garde Musique comme nom et lit le nombre de résultats en description", () => {
    const { box } = renderField({ count: 128 });

    expect(box).toHaveAccessibleDescription("128");
  });
});

describe("CheckboxGroup", () => {
  it("se trouve par sa légende : Catégories", () => {
    render(
      <CheckboxGroup legend="Catégories">
        <CheckboxField label="Musique" checked={false} onCheckedChange={vi.fn()} />
      </CheckboxGroup>,
    );

    expect(screen.getByRole("group", { name: "Catégories" })).toBeInTheDocument();
  });
});
