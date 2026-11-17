import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RangeSlider } from "./range-slider";

function renderPriceMax() {
  const onValueChange = vi.fn();
  render(
    <RangeSlider
      label="Prix max"
      min={0}
      max={50}
      value={15}
      format={(value) => `${value} €`}
      onValueChange={onValueChange}
    />,
  );
  return { onValueChange, slider: screen.getByRole("slider", { name: "Prix max" }) };
}

describe("RangeSlider", () => {
  it("renvoie la nouvelle valeur en nombre quand on le déplace", () => {
    const { onValueChange, slider } = renderPriceMax();

    fireEvent.change(slider, { target: { value: "20" } });

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(20);
  });

  it("affiche et annonce la valeur avec son unité", () => {
    const { slider } = renderPriceMax();

    expect(slider).toHaveAttribute("aria-valuetext", "15 €");
    expect(screen.getByRole("status")).toHaveTextContent("15 €");
  });
});
