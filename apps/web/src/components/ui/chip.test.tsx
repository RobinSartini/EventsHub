import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Chip, RemovableChip } from "./chip";

describe("Chip", () => {
  it("indique s'il est choisi", () => {
    render(<Chip selected>Musique</Chip>);

    expect(screen.getByRole("button", { name: "Musique" })).toHaveAttribute("aria-pressed", "true");
  });

  it("demande à basculer quand on clique dessus", async () => {
    const onSelectedChange = vi.fn();
    render(
      <Chip selected={false} onSelectedChange={onSelectedChange}>
        Musique
      </Chip>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Musique" }));

    expect(onSelectedChange).toHaveBeenCalledOnce();
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });
});

describe("RemovableChip", () => {
  it("annonce le filtre qu'il retire", () => {
    render(<RemovableChip label="Musique" onRemove={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Retirer le filtre Musique" })).toBeInTheDocument();
  });

  it("appelle onRemove au clic", async () => {
    const onRemove = vi.fn();
    render(<RemovableChip label="Musique" onRemove={onRemove} />);

    await userEvent.click(screen.getByRole("button", { name: "Retirer le filtre Musique" }));

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
