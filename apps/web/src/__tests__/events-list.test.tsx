import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HomeSearch } from "@/components/navigation/home-search";
import Home from "@/routes/_index";

import { lastEventsUrl, stubApi } from "./stub-api";

const mockEvents = [
  { id: "1", name: "Concert Jazz", organizerId: "o1", startDate: "2026-12-01T20:00:00Z" },
  { id: "2", name: "Expo Photo", organizerId: "o1", startDate: "2026-12-05T10:00:00Z" },
  { id: "3", name: "Marathon Paris", organizerId: "o2", startDate: "2026-12-10T08:00:00Z" },
];

function renderHome(url = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={[url]}>
        <QueryClientProvider client={queryClient}>
          <HomeSearch />
          <Home />
        </QueryClientProvider>
      </MemoryRouter>,
    ),
  };
}

describe("US-02 – Parcourir les événements à l'accueil", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should display events list without being authenticated", async () => {
    stubApi({ events: mockEvents });

    renderHome();

    await waitFor(() => {
      expect(screen.getByText("Concert Jazz")).toBeInTheDocument();
      expect(screen.getByText("Expo Photo")).toBeInTheDocument();
      expect(screen.getByText("Marathon Paris")).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("3 événements à venir");
  });

  it("500 – should display an error message", async () => {
    stubApi({ status: 500 });

    renderHome();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/erreur/i);
    });
  });

  it("should display an empty state when no event matches", async () => {
    stubApi({ events: [] });

    renderHome("/?q=introuvable");

    expect(await screen.findByText(/aucun événement/i)).toBeInTheDocument();
  });

  describe("Afficher plus", () => {
    it("should append the next events below the first ones", async () => {
      const fetchMock = stubApi({ events: mockEvents, total: 30 });
      const { user } = renderHome();

      expect(await screen.findByText("Encore 27 événements à découvrir")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Afficher plus" }));

      await waitFor(() => {
        expect(screen.getAllByText("Concert Jazz")).toHaveLength(2);
      });
      expect(lastEventsUrl(fetchMock)).toContain("page=2");
      expect(screen.getByText("Encore 24 événements à découvrir")).toBeInTheDocument();
    });

    it("should hide the button when everything is loaded", async () => {
      stubApi({ events: mockEvents });

      renderHome();

      await screen.findByText("Concert Jazz");
      expect(screen.queryByRole("button", { name: "Afficher plus" })).not.toBeInTheDocument();
    });
  });
});
