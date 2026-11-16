import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./switch";

function renderSwitch({ checked = false, disabled = false } = {}) {
  const onCheckedChange = vi.fn();
  render(
    <Switch
      label="Accessible PMR"
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
    />,
  );
  return { onCheckedChange, control: screen.getByRole("switch", { name: "Accessible PMR" }) };
}

describe("Switch", () => {
  it("se trouve par son libellé et annonce son état", () => {
    const { control } = renderSwitch();

    expect(control).toHaveAttribute("aria-checked", "false");
  });

  it("appelle onCheckedChange avec true au clic", async () => {
    const { control, onCheckedChange } = renderSwitch();

    await userEvent.click(control);

    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("s'allume à la touche Espace", async () => {
    const { control, onCheckedChange } = renderSwitch();

    control.focus();
    await userEvent.keyboard(" ");

    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("s'allume au clic sur le libellé", async () => {
    const { onCheckedChange } = renderSwitch();

    await userEvent.click(screen.getByText("Accessible PMR"));

    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("appelle onCheckedChange avec false quand il est allumé", async () => {
    const { control, onCheckedChange } = renderSwitch({ checked: true });

    await userEvent.click(control);

    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("ne réagit plus quand il est désactivé", async () => {
    const { control, onCheckedChange } = renderSwitch({ disabled: true });

    await userEvent.click(control);

    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
