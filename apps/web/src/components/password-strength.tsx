import { passwordStrength } from "@/lib/password-strength";
import { cn } from "@/lib/utils";

/** Jauge de robustesse sous le champ mot de passe (indicative, n'empêche pas l'envoi). */
export function PasswordStrength({ value }: Readonly<{ value: string }>) {
  const { level, label, hint } = passwordStrength(value);
  if (level === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div aria-hidden="true" className="flex gap-1.5">
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={cn(
              "h-1 flex-1 rounded-full",
              bar <= level ? (level === 1 ? "bg-signal" : "bg-primary") : "bg-muted",
            )}
          />
        ))}
      </div>
      <p aria-live="polite" className="text-muted-foreground text-xs">
        <span className="text-foreground font-bold">{label}</span>
        {hint && ` — ${hint}`}
      </p>
    </div>
  );
}
