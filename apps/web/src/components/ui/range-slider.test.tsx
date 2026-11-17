import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { RangeSlider } from "./range-slider";

const euros = (value: number) => `${value} €`;

function PriceMax({ onValueChange }: Readonly<{ onValueChange: (value: number) => void }>) {
  const [value, setValue] = useState(15);
  return (
    <RangeSlider
      label="Prix max"
      min={0}
      max={50}
      value={value}
      format={euros}
      onValueChange={(next) => {
        onValueChange(next);
        setValue(next);
      }}
    />
  );
}

describe("RangeSlider", () => {
  it("vaut 15 au départ pour Prix max", () => {
    render(<PriceMax onValueChange={vi.fn()} />);

    expect(screen.getByRole("slider", { name: "Prix max" })).toHaveValue("15");
  });

  it("affiche 20 € et prévient le parent après être passé à 20", () => {
    const onValueChange = vi.fn();
    render(<PriceMax onValueChange={onValueChange} />);

    fireEvent.change(screen.getByRole("slider", { name: "Prix max" }), { target: { value: "20" } });

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(20);
    expect(screen.getByRole("status")).toHaveTextContent("20 €");
  });

  it("annonce l'unité dans aria-valuetext", () => {
    render(<PriceMax onValueChange={vi.fn()} />);

    expect(screen.getByRole("slider", { name: "Prix max" })).toHaveAttribute(
      "aria-valuetext",
      "15 €",
    );
  });
});
