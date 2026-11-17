import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { EventCard, type EventCardEvent } from "./event-card";

const NUIT_FLUO: EventCardEvent = {
  id: "evt_1",
  name: "Nuit Fluo",
  startDate: "2026-11-14T20:00:00Z",
  location: "Les Docks",
  capacity: 80,
  ticketsSold: 62,
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
  it("affiche le nom de l'événement comme un titre", () => {
    renderCard();

    expect(screen.getByRole("heading", { name: "Nuit Fluo" })).toBeInTheDocument();
  });

  it("mène à /events/:id", () => {
    renderCard();

    expect(screen.getByRole("link", { name: "Nuit Fluo" })).toHaveAttribute(
      "href",
      "/events/evt_1",
    );
  });

  it("affiche la date, l'heure de Paris, le lieu, le prix et la jauge", () => {
    renderCard();

    expect(screen.getByText("SAM 14 NOV")).toBeInTheDocument();
    expect(screen.getByText("21:00 - Les Docks")).toBeInTheDocument();
    expect(screen.getByText(/^12\s€$/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Places réservées" })).toBeInTheDocument();
  });

  it("convertit les centimes du contrat en euros", () => {
    renderCard({ event: { ...NUIT_FLUO, priceCents: 1250 } });

    expect(screen.getByText(/^12,50\s€$/)).toBeInTheDocument();
  });

  it("affiche Gratuit pour un prix à 0 centime", () => {
    renderCard({ event: { ...NUIT_FLUO, priceCents: 0 } });

    expect(screen.getByText("Gratuit")).toBeInTheDocument();
  });

  it("place le prix à côté de la phrase de la jauge", () => {
    renderCard();

    expect(screen.getByText(/^12\s€$/).parentElement).toContainElement(
      screen.getByText("Plus que 18 places"),
    );
  });

  it("affiche le prix seul, hors jauge, sans capacité", () => {
    renderCard({ event: { ...NUIT_FLUO, capacity: null } });

    const price = screen.getByText(/^12\s€$/);
    expect(price.closest('[data-slot="capacity-bar"]')).toBeNull();
    expect(price.parentElement?.children).toHaveLength(1);
  });

  it("s'affiche sans description, date de fin, lieu, prix ni capacité", () => {
    renderCard({ event: { id: "evt_2", name: "Jam session", startDate: "2026-11-13T19:30:00Z" } });

    expect(screen.getByRole("heading", { name: "Jam session" })).toBeInTheDocument();
    expect(screen.getByText("20:30")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("affiche Annulé et cache la jauge pour un événement annulé", () => {
    renderCard({ event: { ...NUIT_FLUO, status: "cancelled" } });

    expect(screen.getByText("Annulé")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
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
