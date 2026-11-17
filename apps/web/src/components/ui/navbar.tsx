import { NavLink } from "react-router";

import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

import { Avatar } from "./avatar";
import { Logo } from "./logo";

type NavBarLink = {
  to: string;
  label: string;
};

type NavBarProps = {
  links: readonly NavBarLink[];
  user: { name: string } | null;
  className?: string;
};

const pill = cn(focusRing, "rounded-full px-4 py-2.5 text-sm font-bold whitespace-nowrap");

function NavBar({ links, user, className }: Readonly<NavBarProps>) {
  return (
    <header data-slot="navbar" className={cn("bg-card border-b", className)}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 md:flex-nowrap md:px-8">
        <Logo />
        <nav
          aria-label="Navigation principale"
          className="order-last flex w-full gap-1 overflow-x-auto md:order-none md:w-auto"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={cn(
                pill,
                "hover:bg-secondary aria-[current=page]:bg-foreground aria-[current=page]:text-background transition-colors",
              )}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        {user ? (
          <Avatar name={user.name} href="/profile" />
        ) : (
          <NavLink to="/login" className={cn(pill, "bg-primary text-primary-foreground")}>
            Se connecter
          </NavLink>
        )}
      </div>
    </header>
  );
}

export { NavBar, type NavBarLink };
