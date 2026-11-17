import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";

import { AuthField } from "./auth-field";
import Loader from "./loader";
import { PasswordStrength } from "./password-strength";
import { Button } from "./ui/button";

// Règles du schéma UserRegister (contrat/openapi.yaml).
const signUpSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe doit contenir au plus 128 caractères"),
});

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      await authClient.signUp.email(
        { name: value.name, email: value.email, password: value.password },
        {
          onSuccess: () => {
            navigate("/");
            toast.success("Compte créé");
          },
          onError: ({ error }) => {
            setSubmitError(authErrorMessage(error.status));
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
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold">Créer un compte</h1>
        <p className="text-muted-foreground text-sm">C'est gratuit et ça prend une minute.</p>
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
            <div className="flex flex-col gap-2">
              <AuthField
                field={field}
                label="Mot de passe"
                type="password"
                autoComplete="new-password"
              />
              <PasswordStrength value={field.state.value} />
            </div>
          )}
        </form.Field>

        {submitError && (
          <p
            role="alert"
            className="bg-destructive/10 text-destructive rounded-2xl px-4 py-3 text-sm font-bold"
          >
            {submitError}
          </p>
        )}

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Création…" : "Créer mon compte"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Déjà un compte ?{" "}
        <Button
          type="button"
          variant="link"
          size="xs"
          onClick={onSwitchToSignIn}
          className="px-0 font-bold"
        >
          Se connecter
        </Button>
      </p>
    </div>
  );
}
