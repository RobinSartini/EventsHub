import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HomeSearch } from "@/components/navigation/home-search";
import Home from "@/routes/_index";

import { lastEventsUrl, stubApi } from "./stub-api";

// Les filtres vivent sur l'accueil : SearchBar (Quoi, Où, Quand) et onglets de catégories.
// `to` (GET /events?to=) n'a pas de champ dans l'interface actuelle, donc pas de test ici.

// --- Fixtures ---
const parisJazzEvents = [
  { id: "1", name: "Concert Jazz Paris", organizerId: "o1", startDate: "2026-12-05T20:00:00Z" },
  { id: "2", name: "Jazz Club Marais", organizerId: "o1", startDate: "2026-12-15T21:00:00Z" },
];

const stubFetch = () => stubApi({ events: parisJazzEvents });
const lastRequestedUrl = lastEventsUrl;
const lastParam = (fetchMock: ReturnType<typeof stubFetch>, name: string) =>
  new URL(lastRequestedUrl(fetchMock) ?? "", "http://localhost").searchParams.get(name);

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <HomeSearch />
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
        expect(lastParam(fetchMock, "from")).toBe(new Date(2026, 11, 5).toISOString());
      });
    });

    it("should fetch events of the category chosen in the tabs", async () => {
      const fetchMock = stubFetch();
      const { user } = renderHome();

      await user.click(await screen.findByRole("radio", { name: "Sport" }));

      await waitFor(() => {
        expect(lastRequestedUrl(fetchMock)).toMatch(/category=sport/i);
      });
    });

    it("should combine category, date and city filters in one request", async () => {
      const fetchMock = stubFetch();
      const { user } = renderHome();

      await user.click(await screen.findByRole("radio", { name: "Sport" }));
      await pickDate(user);
      await searchCity(user, "Paris");

      await waitFor(() => {
        const url = lastRequestedUrl(fetchMock);
        expect(url).toMatch(/category=sport/i);
        expect(lastParam(fetchMock, "from")).toBe(new Date(2026, 11, 5).toISOString());
        expect(url).toContain("city=Paris");
      });
    });

    it("should display the events returned for the combined filters", async () => {
      stubFetch();
      const { user } = renderHome();

      await user.click(await screen.findByRole("radio", { name: "Sport" }));
      await searchCity(user, "Paris");

      await waitFor(() => {
        expect(screen.getByText("Concert Jazz Paris")).toBeInTheDocument();
        expect(screen.getByText("Jazz Club Marais")).toBeInTheDocument();
      });
    });
  });

  describe("Catégories", () => {
    it("should select « Tout » by default", async () => {
      stubFetch();
      renderHome();

      expect(await screen.findByRole("radio", { name: "Tout" })).toBeChecked();
    });

    it("should fetch tonight's events with « Ce soir »", async () => {
      const fetchMock = stubFetch();
      const { user } = renderHome();

      await user.click(screen.getByRole("radio", { name: "Ce soir" }));

      await waitFor(() => {
        expect(lastParam(fetchMock, "from")).toBe(new Date(2026, 10, 16, 18).toISOString());
        expect(lastParam(fetchMock, "to")).toBe(
          new Date(2026, 10, 16, 23, 59, 59, 999).toISOString(),
        );
      });
    });

    it("should keep the category when only the city is cleared", async () => {
      const fetchMock = stubFetch();
      const { user } = renderHome();
      await user.click(await screen.findByRole("radio", { name: "Sport" }));
      await searchCity(user, "Paris");

      await user.click(screen.getByRole("button", { name: "Effacer la ville" }));
      await user.click(screen.getByRole("button", { name: "Rechercher" }));

      expect(screen.getByRole("radio", { name: "Sport" })).toBeChecked();
      await waitFor(() => {
        const url = lastRequestedUrl(fetchMock);
        expect(url).toMatch(/category=sport/i);
        expect(url).not.toContain("city=");
      });
    });

    it("should clear all filters and request events without category when reset is clicked", async () => {
      const fetchMock = stubFetch();
      const { user } = renderHome();
      await user.click(await screen.findByRole("radio", { name: "Sport" }));
      await searchCity(user, "Paris");

      await user.click(screen.getByRole("button", { name: "Tout effacer" }));

      expect(screen.getByRole("radio", { name: "Tout" })).toBeChecked();
      expect(screen.getByLabelText("Où")).toHaveValue("");
      await waitFor(() => {
        const url = lastRequestedUrl(fetchMock);
        expect(url).not.toContain("category=");
        expect(url).not.toContain("city=");
      });
    });
  });

  describe("Fenêtre Filtres", () => {
    function stubPosition(granted: boolean) {
      const getCurrentPosition = vi.fn(
        (onSuccess: PositionCallback, onError?: PositionErrorCallback | null) =>
          granted
            ? onSuccess({ coords: { latitude: 44.93, longitude: 4.89 } } as GeolocationPosition)
            : onError?.({ code: 1 } as GeolocationPositionError),
      );
      Object.defineProperty(navigator, "geolocation", {
        value: { getCurrentPosition },
        configurable: true,
      });
    }

    async function sortByDistance(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole("button", { name: /Filtres/ }));
      await user.click(await screen.findByRole("button", { name: "Distance" }));
      await user.click(screen.getByRole("button", { name: "Afficher les résultats" }));
    }

    afterEach(() => {
      Reflect.deleteProperty(navigator, "geolocation");
    });

    it("should sort events around the user's position", async () => {
      stubPosition(true);
      const fetchMock = stubFetch();
      const { user } = renderHome();

      await sortByDistance(user);

      await waitFor(() => {
        const url = lastRequestedUrl(fetchMock);
        expect(url).toContain("sort=distance");
        expect(url).toContain("lat=44.93");
        expect(url).toContain("lng=4.89");
      });
      expect(screen.getByText("Triés par distance")).toBeInTheDocument();
    });

    it("should fall back to date order when the position is refused", async () => {
      stubPosition(false);
      const fetchMock = stubFetch();
      const { user } = renderHome();

      await sortByDistance(user);

      expect(await screen.findByText(/position indisponible/i)).toBeInTheDocument();
      await waitFor(() => {
        expect(lastRequestedUrl(fetchMock)).not.toContain("sort=");
      });
    });
  });
});
