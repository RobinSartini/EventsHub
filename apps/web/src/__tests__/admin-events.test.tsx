import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { authClient } from "@/lib/auth-client";
import AdminEvents from "@/routes/admin.events";

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
  trpc: {},
  queryClient: null,
}));

const adminSession = {
  data: {
    user: { id: "u1", name: "Admin", email: "admin@test.com", emailVerified: true },
  },
  isPending: false,
};

function renderAdminEvents() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminEvents />
    </QueryClientProvider>,
  );
}

describe("US-04 – Modérer les événements (admin)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockNavigate.mockReset();
  });

  describe("Contrôle d'accès", () => {
    it("should redirect non-admin user to home", async () => {
      vi.mocked(authClient.useSession).mockReturnValue({
        data: {
          user: { id: "u2", name: "Alice", email: "alice@test.com", emailVerified: true },
        },
        isPending: false,
      } as never);

      renderAdminEvents();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    it("should redirect unauthenticated user to login", async () => {
      vi.mocked(authClient.useSession).mockReturnValue({
        data: null,
        isPending: false,
      } as never);

      renderAdminEvents();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    it("should render page for admin", async () => {
      vi.mocked(authClient.useSession).mockReturnValue(adminSession as never);

      renderAdminEvents();

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  // Les endpoints GET /admin/events, PATCH /admin/events/:id et DELETE /admin/events/:id
  // ne sont pas encore définis dans contrat/openapi.yaml — tests à ajouter lors de la mise à jour du contrat.
  describe("Liste des événements", () => {
    it.todo("should display events list for admin");
  });

  describe("Modification d'un événement", () => {
    it.todo("should update event status when admin changes it");
  });

  describe("Suppression d'un événement", () => {
    it.todo("should remove event from list after admin deletes it");
  });
});
