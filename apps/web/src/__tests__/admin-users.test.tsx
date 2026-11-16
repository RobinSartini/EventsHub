import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { authClient } from "@/lib/auth-client";
import AdminUsers from "@/routes/admin.users";

const mockNavigate = vi.fn();

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
                if (!res.ok) throw new Error("Forbidden");
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
  { id: "u2", name: "Alice", email: "alice@test.com", emailVerified: true },
  { id: "u3", name: "Bob", email: "bob@test.com", emailVerified: false },
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

describe("US-03 – Gérer les utilisateurs (admin)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockNavigate.mockReset();
  });

  describe("Contrôle d'accès", () => {
    it("should redirect non-admin user to home", async () => {
      vi.mocked(authClient.useSession).mockReturnValue(userSession as never);

      renderAdminUsers();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    it("should redirect unauthenticated user to login", async () => {
      vi.mocked(authClient.useSession).mockReturnValue({
        data: null,
        isPending: false,
      } as never);

      renderAdminUsers();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });
  });

  describe("Liste des utilisateurs", () => {
    beforeEach(() => {
      vi.mocked(authClient.useSession).mockReturnValue(adminSession as never);
    });

    it("should display users list for admin", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => mockUsers,
        }),
      );

      renderAdminUsers();

      await waitFor(() => {
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
      });
    });
  });
});
