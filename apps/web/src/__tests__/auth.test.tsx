// it.fails : rouge tant que la fonctionnalité n'est pas développée. Retirer .fails au fur et à mesure.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import AppNavBar from "@/components/app-navbar";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";

const mockNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn().mockReturnValue({ data: null, isPending: false }),
    signUp: { email: vi.fn() },
    signIn: { email: vi.fn() },
    signOut: vi.fn(),
  },
}));

type Callbacks = { onSuccess?: () => void; onError?: (ctx: unknown) => void };

const statusText: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
};

function respondWith(status: number) {
  return async (_body: unknown, callbacks: Callbacks = {}) => {
    if (status === 200) {
      callbacks.onSuccess?.();
      return { data: {}, error: null };
    }
    const error = { status, statusText: statusText[status], message: statusText[status] };
    callbacks.onError?.({ error });
    return { data: null, error };
  };
}

const account = { name: "Ada", email: "ada@example.com", password: "password123" };

async function fillSignUp() {
  const user = userEvent.setup();
  render(<SignUpForm onSwitchToSignIn={vi.fn()} />);
  await user.type(screen.getByLabelText(/name|nom/i), account.name);
  await user.type(screen.getByLabelText(/email/i), account.email);
  await user.type(screen.getByLabelText(/^(password|mot de passe)$/i), account.password);
  await user.click(screen.getByRole("button", { name: /^(sign up|créer mon compte)$/i }));
}

async function fillSignIn() {
  const user = userEvent.setup();
  render(<SignInForm onSwitchToSignUp={vi.fn()} />);
  await user.type(screen.getByLabelText(/email/i), account.email);
  await user.type(screen.getByLabelText(/^(password|mot de passe)$/i), account.password);
  await user.click(screen.getByRole("button", { name: /^(sign in|se connecter)$/i }));
}

afterEach(() => {
  vi.clearAllMocks();
  vi.mocked(authClient.useSession).mockReturnValue({ data: null, isPending: false } as never);
});

describe("US-01 – POST /api/auth/sign-up/email", () => {
  it("200 – should send name, email and password and redirect to home", async () => {
    vi.mocked(authClient.signUp.email).mockImplementation(respondWith(200) as never);

    await fillSignUp();

    await waitFor(() => {
      expect(authClient.signUp.email).toHaveBeenCalledWith(account, expect.anything());
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("400 – should display an invalid data error", async () => {
    vi.mocked(authClient.signUp.email).mockImplementation(respondWith(400) as never);

    await fillSignUp();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/données invalides/i);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("422 – should tell the email is already used", async () => {
    vi.mocked(authClient.signUp.email).mockImplementation(respondWith(422) as never);

    await fillSignUp();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/email.*déjà utilisé/i);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("500 – should display a server error", async () => {
    vi.mocked(authClient.signUp.email).mockImplementation(respondWith(500) as never);

    await fillSignUp();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/erreur/i);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("US-01 – POST /api/auth/sign-in/email", () => {
  it("200 – should send email and password and redirect to home", async () => {
    vi.mocked(authClient.signIn.email).mockImplementation(respondWith(200) as never);

    await fillSignIn();

    await waitFor(() => {
      expect(authClient.signIn.email).toHaveBeenCalledWith(
        { email: account.email, password: account.password },
        expect.anything(),
      );
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("400 – should display an invalid data error", async () => {
    vi.mocked(authClient.signIn.email).mockImplementation(respondWith(400) as never);

    await fillSignIn();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/données invalides/i);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("401 – should tell the credentials are wrong", async () => {
    vi.mocked(authClient.signIn.email).mockImplementation(respondWith(401) as never);

    await fillSignIn();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/identifiants incorrects/i);
    });
    // Une seule annonce : l'alerte du formulaire, pas de toast en double.
    expect(toast.error).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("500 – should display a server error", async () => {
    vi.mocked(authClient.signIn.email).mockImplementation(respondWith(500) as never);

    await fillSignIn();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/erreur/i);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

// get-session : l'affichage « connecté / Se connecter » du header est couvert ci-dessous (AppNavBar).
function renderNavBar(signedIn: boolean) {
  vi.mocked(authClient.useSession).mockReturnValue({
    data: signedIn
      ? { user: { id: "u1", name: "Ada", email: account.email, emailVerified: true } }
      : null,
    isPending: false,
  } as never);
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <AppNavBar />
    </MemoryRouter>,
  );
  return user;
}

function signOutRespondsWith(status: number) {
  vi.mocked(authClient.signOut).mockImplementation((async (options: { fetchOptions?: Callbacks }) =>
    respondWith(status)(undefined, options?.fetchOptions)) as never);
}

describe("US-01 – GET /api/auth/get-session : header", () => {
  it.fails("200 – should show the sign-out button and no sign-in link when signed in", () => {
    renderNavBar(true);

    expect(screen.getByRole("button", { name: "Se déconnecter" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Se connecter" })).not.toBeInTheDocument();
  });

  it.fails("401 – should show the sign-in link and no sign-out button when signed out", () => {
    renderNavBar(false);

    expect(screen.getByRole("link", { name: "Se connecter" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: "Se déconnecter" })).not.toBeInTheDocument();
  });
});

describe("US-01 – POST /api/auth/sign-out : header", () => {
  it.fails("200 – should sign out and redirect to home", async () => {
    signOutRespondsWith(200);
    const user = renderNavBar(true);

    await user.click(screen.getByRole("button", { name: "Se déconnecter" }));

    await waitFor(() => {
      expect(authClient.signOut).toHaveBeenCalledOnce();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it.fails("401 – should redirect to login when there is no active session", async () => {
    signOutRespondsWith(401);
    const user = renderNavBar(true);

    await user.click(screen.getByRole("button", { name: "Se déconnecter" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
