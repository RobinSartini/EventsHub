import { EyeIcon, EyeOffIcon } from "lucide-react";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";

import { Input } from "./ui/input";
import { Label } from "./ui/label";

type FieldLike = {
  name: string;
  state: { value: string; meta: { errors: ReadonlyArray<{ message?: string } | undefined> } };
  handleBlur: () => void;
  handleChange: (value: string) => void;
};

type AuthFieldProps = {
  field: FieldLike;
  label: string;
} & Pick<ComponentProps<"input">, "type" | "autoComplete">;

/** Champ libellé + message d'erreur, partagé par les formulaires de connexion et d'inscription. */
export function AuthField({ field, label, type = "text", autoComplete }: AuthFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isPassword = type === "password";

  // Remasque le mot de passe avant l'envoi : sinon le navigateur proposerait de l'enregistrer en clair.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!isPassword || !form) return;
    const mask = () => flushSync(() => setRevealed(false));
    form.addEventListener("submit", mask, { capture: true });
    return () => form.removeEventListener("submit", mask, { capture: true });
  }, [isPassword]);
  const errors = field.state.meta.errors.filter(Boolean);
  const errorId = `${field.name}-error`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={field.name} className="text-sm font-bold">
        {label}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={field.name}
          name={field.name}
          type={isPassword && revealed ? "text" : type}
          autoComplete={autoComplete}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={errors.length > 0 || undefined}
          aria-describedby={errors.length > 0 ? errorId : undefined}
          className={cn(
            "border-border bg-card h-12 rounded-full border-2 px-[18px] text-sm md:text-sm",
            isPassword && "pr-12",
          )}
        />
        {isPassword && (
          <button
            type="button"
            aria-label="Afficher le mot de passe"
            aria-pressed={revealed}
            onClick={() => setRevealed((value) => !value)}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-4 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2"
          >
            {revealed ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        )}
      </div>
      {errors.length > 0 && (
        <p id={errorId} role="alert" className="text-destructive text-sm">
          {errors[0]?.message}
        </p>
      )}
    </div>
  );
}
