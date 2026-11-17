import { useForm } from "@tanstack/react-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";

import { AuthField } from "./auth-field";
import Loader from "./loader";
import { Button } from "./ui/button";

const signInSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        { email: value.email, password: value.password },
        {
          onSuccess: () => {
            navigate("/");
            toast.success("Connexion réussie");
          },
          onError: ({ error }) => {
            toast.error(authErrorMessage(error.status));
          },
        },
      );
    },
    validators: { onSubmit: signInSchema },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-display text-3xl font-extrabold">Connexion</h1>
        <p className="text-muted-foreground text-sm">Content de te revoir !</p>
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
        <form.Field name="email">
          {(field) => <AuthField field={field} label="Email" type="email" autoComplete="email" />}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <AuthField
              field={field}
              label="Mot de passe"
              type="password"
              autoComplete="current-password"
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
              {state.isSubmitting ? "Connexion…" : "Se connecter"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Pas encore de compte ?{" "}
        <Button variant="link" size="xs" onClick={onSwitchToSignUp} className="px-0">
          Créer un compte
        </Button>
      </p>
    </div>
  );
}
