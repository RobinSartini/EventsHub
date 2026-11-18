import { describe, expect, it } from "vitest";

import { passwordStrength } from "./password-strength";

describe("passwordStrength", () => {
  it("ne mesure rien sur un mot de passe vide", () => {
    expect(passwordStrength("").level).toBe(0);
  });

  it("juge trop court un mot de passe de moins de 8 caractères", () => {
    expect(passwordStrength("Ab1!").level).toBe(1);
  });

  it("juge moyen un mot de passe d'une seule famille de caractères", () => {
    expect(passwordStrength("abcdefgh").level).toBe(2);
  });

  it("juge solide un mot de passe mêlant lettres et chiffres", () => {
    expect(passwordStrength("Abcdefg1").level).toBe(3);
  });

  it("juge très solide un mot de passe long mêlant toutes les familles", () => {
    expect(passwordStrength("Abcdefg1!xyz").level).toBe(4);
  });
});
