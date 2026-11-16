import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import Header from "@/components/header";
import Search from "@/routes/search";

// --- Router mock ---
const mockNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    NavLink: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
    useNavigate: () => mockNavigate,
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
      <QueryClientProvider client={queryClient}>
        <Search />
      </QueryClientProvider>,
    ),
  };
}

describe("US-05 – Rechercher un événement par mot-clé", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockNavigate.mockReset();
  });

  it("should display a search bar in the header", () => {
    render(<Header />);

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("should display results matching the keyword", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => jazzEvents,
      }),
    );

    renderSearch();

    await waitFor(() => {
      expect(screen.getByText("Concert Jazz")).toBeInTheDocument();
      expect(screen.getByText("Jazz & Blues Festival")).toBeInTheDocument();
    });
  });

  it("should display an empty state message when no results", async () => {
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
});
