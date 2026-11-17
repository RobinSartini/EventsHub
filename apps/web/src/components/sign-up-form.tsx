import { useForm } from "@tanstack/react-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";

import { AuthField } from "./auth-field";
import Loader from "./loader";
import { Button } from "./ui/button";

// Règles du schéma UserRegister (contrat/openapi.yaml).
const signUpSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe doit contenir au plus 128 caractères"),
});

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        { name: value.name, email: value.email, password: value.password },
        {
          onSuccess: () => {
            navigate("/");
            toast.success("Compte créé");
          },
          onError: ({ error }) => {
            toast.error(authErrorMessage(error.status));
          },
        },
      );
    },
    validators: { onSubmit: signUpSchema },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-display text-3xl font-extrabold">Créer un compte</h1>
        <p className="text-muted-foreground text-sm">
          Rejoins EventsHub pour découvrir les événements autour de toi.
        </p>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <form.Field name="name">
          {(field) => <AuthField field={field} label="Nom" autoComplete="name" />}
        </form.Field>

        <form.Field name="email">
          {(field) => <AuthField field={field} label="Email" type="email" autoComplete="email" />}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <AuthField
              field={field}
              label="Mot de passe"
              type="password"
              autoComplete="new-password"
            />
          )}
        </form.Field>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Création…" : "S'inscrire"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Déjà un compte ?{" "}
        <Button variant="link" size="xs" onClick={onSwitchToSignIn} className="px-0">
          Me connecter
        </Button>
      </p>
    </div>
  );
}
