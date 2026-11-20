import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { EventCard, type EventCardEvent } from "./event-card";

const NUIT_FLUO: EventCardEvent = {
  id: "evt_1",
  name: "Nuit Fluo",
  startDate: "2026-11-14T20:00:00Z",
  location: "Les Docks, Valence",
  priceCents: 1200,
};

function renderCard(props: Partial<Parameters<typeof EventCard>[0]> = {}) {
  return render(
    <MemoryRouter>
      <EventCard event={NUIT_FLUO} {...props} />
    </MemoryRouter>,
  );
}

describe("EventCard", () => {
  it("mène à /events/:id", () => {
    renderCard();

    expect(screen.getByRole("link", { name: "Nuit Fluo" })).toHaveAttribute(
      "href",
      "/events/evt_1",
    );
  });

  it("affiche le prix par personne", () => {
    renderCard();

    expect(screen.getByText(/^12\s€$/).parentElement).toHaveTextContent(/^12\s€ par personne$/);
  });

  it("affiche Gratuit sans « par personne »", () => {
    renderCard({ event: { ...NUIT_FLUO, priceCents: 0 } });

    expect(screen.getByText("Gratuit").parentElement).toHaveTextContent(/^Gratuit$/);
  });

  it("s'affiche avec seulement un nom et une date", () => {
    renderCard({ event: { id: "evt_2", name: "Jam session", startDate: "2026-11-13T19:30:00Z" } });

    expect(screen.getByRole("heading", { name: "Jam session" })).toBeInTheDocument();
    expect(screen.getByText("Ven. 13 nov - 20:30")).toBeInTheDocument();
  });

  it("signale un événement annulé", () => {
    renderCard({ event: { ...NUIT_FLUO, status: "cancelled" } });

    expect(screen.getByText("Annulé")).toBeInTheDocument();
  });

  it("donne au cœur le nom de l'événement et prévient le parent au clic", async () => {
    const onToggleFavorite = vi.fn();
    renderCard({ onToggleFavorite });

    await userEvent.click(screen.getByRole("button", { name: "Ajouter Nuit Fluo aux favoris" }));

    expect(onToggleFavorite).toHaveBeenCalledOnce();
  });

  it("n'affiche pas de cœur sans onToggleFavorite", () => {
    renderCard();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
