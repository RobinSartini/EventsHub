// it.fails : rouge tant que la fonctionnalité n'est pas développée. Retirer .fails au fur et à mesure.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import Search from "@/routes/search";

// --- Router mock ---
const mockNavigate = vi.fn();
const searchParams = vi.hoisted(() => ({ current: new URLSearchParams() }));

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    NavLink: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [searchParams.current, vi.fn()],
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
        queryOptions: (params: { q?: string } = {}) => ({
          queryKey: ["events", "list", params],
          queryFn: () => {
            const url = new URL("/events", "http://localhost");
            if (params.q) url.searchParams.set("q", params.q);
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
const jazzEvents = [
  { id: "1", name: "Concert Jazz", organizerId: "o1", startDate: "2026-12-01T20:00:00Z" },
  { id: "2", name: "Jazz & Blues Festival", organizerId: "o1", startDate: "2026-12-10T18:00:00Z" },
];

function renderSearch() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <Search />
        </QueryClientProvider>
      </MemoryRouter>,
    ),
  };
}

describe("US-05 – Rechercher un événement par mot-clé", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockNavigate.mockReset();
    searchParams.current = new URLSearchParams();
  });

  it.fails("should display the search bar", () => {
    renderSearch();

    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it.fails("should navigate to /search with the keyword when submitting the search bar", async () => {
    const { user } = renderSearch();

    await user.type(screen.getByRole("searchbox"), "jazz");
    await user.click(screen.getByRole("button", { name: "Rechercher" }));

    expect(mockNavigate).toHaveBeenCalledWith("/search?q=jazz");
  });

  it.fails("should request GET /events with the q parameter from the URL", async () => {
    searchParams.current = new URLSearchParams("q=jazz");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => jazzEvents,
    });
    vi.stubGlobal("fetch", fetchMock);

    renderSearch();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("q=jazz"));
    });
  });

  it.fails("should display results matching the keyword", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => jazzEvents,
      }),
    );

    searchParams.current = new URLSearchParams("q=jazz");
    renderSearch();

    await waitFor(() => {
      expect(screen.getByText("Concert Jazz")).toBeInTheDocument();
      expect(screen.getByText("Jazz & Blues Festival")).toBeInTheDocument();
    });
  });

  it.fails("should display an empty state message when no results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
      }),
    );

    renderSearch();

    await waitFor(() => {
      expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument();
    });
  });

  it.fails("500 – should display an error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => null }),
    );

    renderSearch();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/erreur/i);
    });
    expect(screen.queryByText(/aucun résultat/i)).not.toBeInTheDocument();
  });
});
