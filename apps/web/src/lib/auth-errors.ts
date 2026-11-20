const MESSAGES: Record<number, string> = {
  400: "Données invalides, vérifie les champs du formulaire.",
  401: "Identifiants incorrects.",
  403: "Ton compte est suspendu.",
  422: "Cet email est déjà utilisé.",
};

const FALLBACK = "Une erreur est survenue, réessaie plus tard.";

/** Message affiché pour un code HTTP renvoyé par les routes /api/auth (contrat/openapi.yaml). */
export function authErrorMessage(status: number | undefined) {
  return (status !== undefined && MESSAGES[status]) || FALLBACK;
}
