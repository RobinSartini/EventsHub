import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import SearchFilters from "@/routes/search.filters";

// --- Router mock ---
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

vi.mock("@/lib/auth-client", () => ({
  authClient: { useSession: vi.fn().mockReturnValue({ data: null, isPending: false }) },
}));

// --- tRPC mock ---
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

function renderSearchFilters() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <SearchFilters />
      </QueryClientProvider>,
    ),
  };
}

describe("US-06 – Filtrer par catégorie, dates et ville", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("Combinaison de filtres", () => {
    it("should fetch events with combined category, date range and city filters", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => parisJazzEvents,
      });
      vi.stubGlobal("fetch", fetchMock);

      renderSearchFilters();

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("category=music"));
        expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("from=2026-12-01"));
        expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("to=2026-12-31"));
        expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("city=Paris"));
      });
    });

    it("should display results after applying combined filters", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => parisJazzEvents,
        }),
      );

      const { user } = renderSearchFilters();

      await user.selectOptions(screen.getByRole("combobox", { name: /catégorie/i }), "music");
      await user.type(screen.getByRole("textbox", { name: /ville/i }), "Paris");
      await user.click(screen.getByRole("button", { name: /appliquer|filtrer/i }));

      await waitFor(() => {
        expect(screen.getByText("Concert Jazz Paris")).toBeInTheDocument();
        expect(screen.getByText("Jazz Club Marais")).toBeInTheDocument();
      });
    });
  });

  // GET /categories n'est pas défini dans contrat/openapi.yaml
  describe("Catégories", () => {
    it.todo("should load categories from GET /categories");
    it.todo("should display categories in filter panel");
  });

  describe("Filtres actifs", () => {
    it("should display active filters as visible tags", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => parisJazzEvents,
        }),
      );

      const { user } = renderSearchFilters();

      await user.type(screen.getByRole("textbox", { name: /ville/i }), "Paris");
      await user.click(screen.getByRole("button", { name: /appliquer|filtrer/i }));

      await waitFor(() => {
        expect(screen.getByText(/Paris/i)).toBeInTheDocument();
      });
    });

    it("should clear all filters when reset is clicked", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => [],
        }),
      );

      const { user } = renderSearchFilters();

      await user.type(screen.getByRole("textbox", { name: /ville/i }), "Paris");
      await user.click(screen.getByRole("button", { name: /appliquer|filtrer/i }));
      await user.click(screen.getByRole("button", { name: /réinitialiser|effacer/i }));

      await waitFor(() => {
        expect(screen.queryByText(/Paris/i)).not.toBeInTheDocument();
      });
    });
  });
});
