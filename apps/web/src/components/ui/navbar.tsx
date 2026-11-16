import { NavLink } from "react-router";

import { cn } from "@/lib/utils";

import { Avatar } from "./avatar";

type NavBarLink = {
  to: string;
  label: string;
};

type NavBarProps = {
  links: readonly NavBarLink[];
  user: { name: string } | null;
  className?: string;
};

function NavBar({ links, user, className }: Readonly<NavBarProps>) {
  return (
    <header data-slot="navbar" className={cn("flex items-center gap-4 px-4 py-2", className)}>
      <NavLink to="/" className="font-display font-extrabold">
        EventsHub
      </NavLink>
      <nav aria-label="Navigation principale" className="flex flex-1 gap-4">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className="aria-[current=page]:font-bold">
            {link.label}
          </NavLink>
        ))}
      </nav>
      <NavLink to="/events/new" className="bg-signal text-signal-foreground rounded-full px-4 py-2">
        Créer un événement
      </NavLink>
      {user ? (
        <Avatar name={user.name} href="/profile" />
      ) : (
        <NavLink to="/login">Se connecter</NavLink>
      )}
    </header>
  );
}

export { NavBar, type NavBarLink };
