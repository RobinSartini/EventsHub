import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { authClient } from "@/lib/auth-client";
import AdminUsers from "@/routes/admin.users";

const mockNavigate = vi.fn();

const { httpError } = vi.hoisted(() => {
  const trpcCodes: Record<number, string> = {
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    500: "INTERNAL_SERVER_ERROR",
  };
  return {
    httpError: (status: number) =>
      Object.assign(new Error(trpcCodes[status] ?? "ERROR"), {
        data: { code: trpcCodes[status], httpStatus: status },
      }),
  };
});

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}));

vi.mock("@/utils/trpc", () => ({
  trpc: {
    admin: {
      users: {
        list: {
          queryOptions: () => ({
            queryKey: ["admin", "users", "list"],
            queryFn: () =>
              fetch("/users").then(async (res) => {
                if (!res.ok) throw httpError(res.status);
                return res.json();
              }),
          }),
        },
      },
    },
  },
  queryClient: null,
}));

const adminSession = {
  data: {
    user: { id: "u1", name: "Admin", email: "admin@test.com", emailVerified: true },
  },
  isPending: false,
};

const userSession = {
  data: {
    user: { id: "u2", name: "Alice", email: "alice@test.com", emailVerified: true },
  },
  isPending: false,
};

const mockUsers = [
  {
    id: "u2",
    name: "Alice",
    email: "alice@test.com",
    emailVerified: true,
    image: null,
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
  },
  {
    id: "u3",
    name: "Bob",
    email: "bob@test.com",
    emailVerified: false,
    image: null,
    createdAt: "2026-11-02T10:00:00Z",
    updatedAt: "2026-11-02T10:00:00Z",
  },
];

function renderAdminUsers() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminUsers />
    </QueryClientProvider>,
  );
}

function mockFetch(status: number, body: unknown = null) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }),
  );
}

describe("US-03 – Gérer les utilisateurs (admin) – GET /users", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockNavigate.mockReset();
  });

  it("200 – should display users list for admin", async () => {
    vi.mocked(authClient.useSession).mockReturnValue(adminSession as never);
    mockFetch(200, mockUsers);

    renderAdminUsers();

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("alice@test.com")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("bob@test.com")).toBeInTheDocument();
    });
  });

  it("200 – should display an empty state when there are no users", async () => {
    vi.mocked(authClient.useSession).mockReturnValue(adminSession as never);
    mockFetch(200, []);

    renderAdminUsers();

    await waitFor(() => {
      expect(screen.getByText(/aucun utilisateur/i)).toBeInTheDocument();
    });
  });

  it("401 – should redirect unauthenticated user to login", async () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: false,
    } as never);
    mockFetch(401);

    renderAdminUsers();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("403 – should redirect non-admin user to home", async () => {
    vi.mocked(authClient.useSession).mockReturnValue(userSession as never);
    mockFetch(403);

    renderAdminUsers();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("500 – should display an error message", async () => {
    vi.mocked(authClient.useSession).mockReturnValue(adminSession as never);
    mockFetch(500);

    renderAdminUsers();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/erreur/i);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
