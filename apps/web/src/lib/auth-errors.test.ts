import { describe, expect, it } from "vitest";

import { authErrorMessage } from "./auth-errors";

describe("authErrorMessage", () => {
  it.each([
    [400, "Données invalides, vérifie les champs du formulaire."],
    [401, "Identifiants incorrects."],
    [403, "Ton compte est suspendu."],
    [422, "Cet email est déjà utilisé."],
  ])("donne le message du contrat pour le code %i", (status, message) => {
    expect(authErrorMessage(status)).toBe(message);
  });

  it("donne un message générique pour une erreur serveur", () => {
    expect(authErrorMessage(500)).toBe("Une erreur est survenue, réessaie plus tard.");
  });

  it("donne un message générique pour un code inconnu ou absent", () => {
    expect(authErrorMessage(418)).toBe("Une erreur est survenue, réessaie plus tard.");
    expect(authErrorMessage(undefined)).toBe("Une erreur est survenue, réessaie plus tard.");
  });
});
