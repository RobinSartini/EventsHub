import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Home from "@/routes/_index";

// Les filtres vivent sur l'accueil : SearchBar (Quoi, Où, Quand) et panneau Catégories.
// `to` (GET /events?to=) n'a pas de champ dans l'interface actuelle, donc pas de test ici.

// --- tRPC mock : construit l'URL de GET /events à partir des filtres (contrat/openapi.yaml) ---
vi.mock("@/utils/trpc", () => ({
  trpc: {
    events: {
      list: {
        queryOptions: (
          params: { category?: string; from?: string; to?: string; city?: string } = {},
        ) => ({
          queryKey: ["events", "list", params],
          queryFn: () => {
            const url = new URL("/events", "http://localhost");
            if (params.category) url.searchParams.set("category", params.category);
            if (params.from) url.searchParams.set("from", params.from);
            if (params.to) url.searchParams.set("to", params.to);
            if (params.city) url.searchParams.set("city", params.city);
            return fetch(url.toString()).then(async (res) => {
              if (!res.ok) throw new Error("Failed to fetch events");
              return res.json();
            });
          },
        }),
      },
    },
  },
  queryClient: null,
}));

// --- Fixtures ---
const parisJazzEvents = [
  { id: "1", name: "Concert Jazz Paris", organizerId: "o1", startDate: "2026-12-05T20:00:00Z" },
  { id: "2", name: "Jazz Club Marais", organizerId: "o1", startDate: "2026-12-15T21:00:00Z" },
];

function stubFetch() {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => parisJazzEvents,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function lastRequestedUrl(fetchMock: ReturnType<typeof stubFetch>) {
  return fetchMock.mock.calls.at(-1)?.[0] as string | undefined;
}

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>
      </MemoryRouter>,
    ),
  };
}

async function searchCity(user: ReturnType<typeof userEvent.setup>, city: string) {
  const input = screen.getByLabelText("Où");
  await user.clear(input);
  await user.type(input, city);
  await user.click(screen.getByRole("button", { name: "Rechercher" }));
}

async function pickDate(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Quand/ }));
  await user.click(await screen.findByRole("button", { name: /5 décembre 2026/ }));
  await user.click(screen.getByRole("button", { name: "Rechercher" }));
}

describe("US-06 – Filtrer par catégorie, dates et ville", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 16));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("Requête GET /events", () => {
    it("should fetch events with the city typed in the search bar", async () => {
      const fetchMock = stubFetch();
      const { user } = renderHome();

      await searchCity(user, "Paris");

      await waitFor(() => {
        expect(lastRequestedUrl(fetchMock)).toContain("city=Paris");
      });
    });

    it("should fetch events from the date chosen in the search bar", async () => {
      const fetchMock = stubFetch();
      const { user } = renderHome();

      await pickDate(user);

      await waitFor(() => {
        expect(lastRequestedUrl(fetchMock)).toContain("from=2026-12-05");
      });
    });

    it("should fetch events of the category checked in the filter panel", async () => {
      const fetchMock = stubFetch();
      const { user } = renderHome();

      await user.click(screen.getByRole("checkbox", { name: /Sport/ }));

      await waitFor(() => {
        expect(lastRequestedUrl(fetchMock)).toMatch(/category=sport/i);
      });
    });

    it("should combine category, date and city filters in one request", async () => {
      const fetchMock = stubFetch();
      const { user } = renderHome();

      await user.click(screen.getByRole("checkbox", { name: /Sport/ }));
      await pickDate(user);
      await searchCity(user, "Paris");

      await waitFor(() => {
        const url = lastRequestedUrl(fetchMock);
        expect(url).toMatch(/category=sport/i);
        expect(url).toContain("from=2026-12-05");
        expect(url).toContain("city=Paris");
      });
    });

    it("should display the events returned for the combined filters", async () => {
      stubFetch();
      const { user } = renderHome();

      await user.click(screen.getByRole("checkbox", { name: /Sport/ }));
      await searchCity(user, "Paris");

      await waitFor(() => {
        expect(screen.getByText("Concert Jazz Paris")).toBeInTheDocument();
        expect(screen.getByText("Jazz Club Marais")).toBeInTheDocument();
      });
    });
  });

  describe("Filtres actifs", () => {
    it("should display a checked category as a removable tag", async () => {
      stubFetch();
      const { user } = renderHome();

      await user.click(screen.getByRole("checkbox", { name: /Sport/ }));

      expect(screen.getByRole("button", { name: "Retirer le filtre Sport" })).toBeInTheDocument();
    });

    it("should uncheck the category when its tag is removed", async () => {
      stubFetch();
      const { user } = renderHome();
      await user.click(screen.getByRole("checkbox", { name: /Sport/ }));

      await user.click(screen.getByRole("button", { name: "Retirer le filtre Sport" }));

      expect(screen.getByRole("checkbox", { name: /Sport/ })).not.toBeChecked();
      expect(
        screen.queryByRole("button", { name: "Retirer le filtre Sport" }),
      ).not.toBeInTheDocument();
    });

    it("should clear all filters and request events without category when reset is clicked", async () => {
      const fetchMock = stubFetch();
      const { user } = renderHome();
      await user.click(screen.getByRole("checkbox", { name: /Sport/ }));

      await user.click(screen.getByRole("button", { name: "Tout effacer" }));

      expect(screen.queryByRole("button", { name: /Retirer le filtre/ })).not.toBeInTheDocument();
      await waitFor(() => {
        const url = lastRequestedUrl(fetchMock);
        expect(url).toBeDefined();
        expect(url).not.toContain("category=");
      });
    });
  });
});
