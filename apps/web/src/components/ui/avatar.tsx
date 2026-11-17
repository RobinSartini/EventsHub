import { UserIcon } from "lucide-react";
import { Link } from "react-router";

import { initials } from "@/lib/initials";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  href?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
};

const sizes = {
  sm: "bg-primary text-primary-foreground size-8 text-xs",
  default: "bg-primary text-primary-foreground size-[46px] text-sm",
  lg: "bg-foreground text-background size-[52px] text-[15px]",
};

function Avatar({ name, href, size = "default", className }: Readonly<AvatarProps>) {
  const letters = initials(name) || <UserIcon className="size-1/2" />;

  const classes = cn(
    "font-display inline-flex shrink-0 items-center justify-center rounded-full font-extrabold",
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link to={href} aria-label="Mon profil" data-slot="avatar" className={cn(focusRing, classes)}>
        <span aria-hidden="true">{letters}</span>
      </Link>
    );
  }

  return (
    <span data-slot="avatar" aria-hidden="true" className={classes}>
      {letters}
    </span>
  );
}

export { Avatar };
