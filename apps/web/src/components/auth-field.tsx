import type { ComponentProps } from "react";

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
  const errors = field.state.meta.errors.filter(Boolean);
  const errorId = `${field.name}-error`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={field.name} className="text-sm font-bold">
        {label}
      </Label>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        autoComplete={autoComplete}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={errors.length > 0 || undefined}
        aria-describedby={errors.length > 0 ? errorId : undefined}
        className="border-border bg-card h-12 rounded-full border-2 px-[18px] text-sm md:text-sm"
      />
      {errors.length > 0 && (
        <p id={errorId} role="alert" className="text-destructive text-sm">
          {errors[0]?.message}
        </p>
      )}
    </div>
  );
}
