export type PasswordStrength = { level: 0 | 1 | 2 | 3 | 4; label: string; hint: string };

const EMPTY: PasswordStrength = { level: 0, label: "", hint: "" };

/** Indication visuelle uniquement : la seule règle du contrat est 8 à 128 caractères. */
export function passwordStrength(password: string): PasswordStrength {
  if (!password) return EMPTY;
  if (password.length < 8) {
    return { level: 1, label: "Trop court", hint: "8 caractères minimum." };
  }
  const points =
    [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((rule) => rule.test(password)).length +
    (password.length >= 12 ? 1 : 0);
  if (points <= 2) {
    return { level: 2, label: "Moyen", hint: "mélange majuscules, chiffres et symboles." };
  }
  if (points === 3) {
    return {
      level: 3,
      label: "Solide",
      hint: "encore un effort pour un mot de passe très solide.",
    };
  }
  return { level: 4, label: "Très solide", hint: "" };
}
