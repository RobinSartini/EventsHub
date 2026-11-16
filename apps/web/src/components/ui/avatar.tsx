import { Link } from "react-router";

import { cn } from "@/lib/utils";

// Composant réservé : API définitive, rendu final dans la PR 4 (#33).
// Les initiales (« Camille Bernard » donne « CB ») arrivent en TDD.

type AvatarProps = {
  /** Nom de la session : user.name. */
  name: string;
  /** Avec un lien, l'avatar s'appelle « Mon profil ». */
  href?: string;
  className?: string;
};

function Avatar({ name, href, className }: Readonly<AvatarProps>) {
  const classes = cn(
    "bg-primary text-primary-foreground inline-flex size-11 items-center justify-center rounded-full font-extrabold",
    className,
  );
  const letter = name.trim().charAt(0).toUpperCase();

  if (href) {
    return (
      <Link to={href} aria-label="Mon profil" data-slot="avatar" className={classes}>
        <span aria-hidden="true">{letter}</span>
      </Link>
    );
  }

  return (
    <span data-slot="avatar" aria-hidden="true" className={classes}>
      {letter}
    </span>
  );
}

export { Avatar };
