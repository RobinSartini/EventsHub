// it.fails : rouge tant que la fonctionnalité n'est pas développée. Retirer .fails au fur et à mesure.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import Home from "@/routes/_index";

const mockEvents = [
  { id: "1", name: "Concert Jazz", organizerId: "o1", startDate: "2026-12-01T20:00:00Z" },
  { id: "2", name: "Expo Photo", organizerId: "o1", startDate: "2026-12-05T10:00:00Z" },
  { id: "3", name: "Marathon Paris", organizerId: "o2", startDate: "2026-12-10T08:00:00Z" },
];

vi.mock("@/utils/trpc", () => ({
  trpc: {
    events: {
      list: {
        queryOptions: () => ({
          queryKey: ["events", "list"],
          queryFn: () =>
            fetch("/events").then(async (res) => {
              if (!res.ok) throw new Error("Failed to fetch events");
              return res.json();
            }),
        }),
      },
    },
  },
  queryClient: null,
}));

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("US-02 – Parcourir les événements à l'accueil", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.fails("should display events list without being authenticated", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockEvents,
      }),
    );

    renderHome();

    await waitFor(() => {
      expect(screen.getByText("Concert Jazz")).toBeInTheDocument();
      expect(screen.getByText("Expo Photo")).toBeInTheDocument();
      expect(screen.getByText("Marathon Paris")).toBeInTheDocument();
    });
  });

  it.fails("500 – should display an error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => null }),
    );

    renderHome();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/erreur/i);
    });
  });
});
