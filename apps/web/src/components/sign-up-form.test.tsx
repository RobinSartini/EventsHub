import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { authClient } from "@/lib/auth-client";

import SignUpForm from "./sign-up-form";

vi.mock("react-router", () => ({ useNavigate: () => vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn().mockReturnValue({ data: null, isPending: false }),
    signUp: { email: vi.fn() },
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

async function fillAndSubmit({
  name,
  password = "password123",
}: {
  name: string;
  password?: string;
}) {
  const user = userEvent.setup();
  render(<SignUpForm onSwitchToSignIn={vi.fn()} />);
  await user.type(screen.getByLabelText("Nom"), name);
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.type(screen.getByLabelText("Mot de passe"), password);
  await user.click(screen.getByRole("button", { name: "Créer mon compte" }));
}

describe("SignUpForm – validation alignée sur le serveur", () => {
  it("refuse un nom fait uniquement d'espaces, comme le serveur", async () => {
    await fillAndSubmit({ name: "   " });

    expect(await screen.findByRole("alert")).toHaveTextContent(/au moins 2 caractères/i);
    expect(authClient.signUp.email).not.toHaveBeenCalled();
  });

  it("refuse un mot de passe de plus de 128 caractères", async () => {
    await fillAndSubmit({ name: "Ada", password: "a".repeat(129) });

    expect(await screen.findByRole("alert")).toHaveTextContent(/au plus 128 caractères/i);
    expect(authClient.signUp.email).not.toHaveBeenCalled();
  });
});
