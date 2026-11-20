import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { QuantityStepper } from "./quantity-stepper";

function renderStepper(value: number) {
  const onValueChange = vi.fn();
  render(
    <QuantityStepper
      label="Standard"
      price={24}
      value={value}
      max={4}
      onValueChange={onValueChange}
    />,
  );
  return {
    onValueChange,
    remove: screen.getByRole("button", { name: "Retirer un billet Standard" }),
    add: screen.getByRole("button", { name: "Ajouter un billet Standard" }),
  };
}

describe("QuantityStepper", () => {
  it("désactive Retirer un billet Standard à zéro", () => {
    const { remove } = renderStepper(0);

    expect(remove).toBeDisabled();
  });

  it("appelle onValueChange avec 1 au clic sur Ajouter", async () => {
    const { add, onValueChange } = renderStepper(0);

    await userEvent.click(add);

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("appelle onValueChange avec 1 au clic sur Retirer depuis 2", async () => {
    const { remove, onValueChange } = renderStepper(2);

    await userEvent.click(remove);

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("désactive Ajouter au maximum", () => {
    const { add } = renderStepper(4);

    expect(add).toBeDisabled();
  });

  it("annonce le nombre de billets aux lecteurs d'écran", () => {
    renderStepper(2);

    expect(screen.getByRole("status")).toHaveTextContent("2 billets Standard");
  });

  it("affiche le prix et Gratuit pour un billet sans prix", () => {
    const { rerender } = render(
      <QuantityStepper label="Solidaire" price={null} value={0} max={2} onValueChange={vi.fn()} />,
    );
    expect(screen.getByText("Gratuit")).toBeInTheDocument();

    rerender(
      <QuantityStepper label="Solidaire" price={12.5} value={0} max={2} onValueChange={vi.fn()} />,
    );
    expect(screen.getByText(/12,50/)).toBeInTheDocument();
  });
});
