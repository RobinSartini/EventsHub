import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AuthField } from "./auth-field";

function makeField(value = "", errors: Array<{ message?: string }> = []) {
  return {
    name: "email",
    state: { value, meta: { errors } },
    handleBlur: vi.fn(),
    handleChange: vi.fn(),
  };
}

describe("AuthField", () => {
  it("associe le libellé au champ", () => {
    render(<AuthField field={makeField()} label="Email" type="email" />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
  });

  it("n'affiche aucune erreur ni attribut d'erreur quand le champ est valide", () => {
    render(<AuthField field={makeField("ada@example.com")} label="Email" />);

    const input = screen.getByLabelText("Email");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("signale le champ invalide et le relie à son message d'erreur", () => {
    render(
      <AuthField
        field={makeField("nope", [{ message: "Adresse email invalide" }])}
        label="Email"
      />,
    );

    const input = screen.getByLabelText("Email");
    const alert = screen.getByRole("alert");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(alert).toHaveTextContent("Adresse email invalide");
    expect(input).toHaveAttribute("aria-describedby", alert.id);
  });

  it("n'affiche que la première erreur", () => {
    render(
      <AuthField
        field={makeField("", [{ message: "Première" }, { message: "Seconde" }])}
        label="Email"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Première");
    expect(screen.queryByText("Seconde")).not.toBeInTheDocument();
  });

  it("transmet la saisie et la perte de focus au champ", async () => {
    const field = makeField();
    render(<AuthField field={field} label="Email" />);

    await userEvent.type(screen.getByLabelText("Email"), "a");
    await userEvent.tab();

    expect(field.handleChange).toHaveBeenCalledWith("a");
    expect(field.handleBlur).toHaveBeenCalledOnce();
  });
});
