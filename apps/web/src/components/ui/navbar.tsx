import { MenuIcon, UserIcon } from "lucide-react";
import { Link, NavLink } from "react-router";

import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

import { Avatar } from "./avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Logo } from "./logo";

type NavBarLink = {
  to: string;
  label: string;
};

type NavBarProps = {
  links: readonly NavBarLink[];
  user: { name: string } | null;
  onSignOut: () => void;
  className?: string;
};

const menuItem = "rounded-xl px-3 py-2.5 text-sm font-bold";

function AccountMenu({ links, user, onSignOut }: Readonly<Omit<NavBarProps, "className">>) {
  const linkItem = (to: string, label: string) => (
    <DropdownMenuItem key={to} className={menuItem} render={<Link to={to} />}>
      {label}
    </DropdownMenuItem>
  );

  return (
    <div className="flex items-center gap-1 rounded-full border p-1 pl-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Menu"
          className={cn(
            focusRing,
            "hover:bg-secondary grid size-8 place-items-center rounded-full",
          )}
        >
          <MenuIcon className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="bg-card shadow-float w-60 rounded-3xl p-2 ring-0"
        >
          {links.map((link) => linkItem(link.to, link.label))}
          <DropdownMenuSeparator className="my-1" />
          {linkItem("/organizer", "Organiser un événement")}
          {user ? (
            <DropdownMenuItem className={menuItem} onClick={onSignOut}>
              Se déconnecter
            </DropdownMenuItem>
          ) : (
            linkItem("/login", "Se connecter")
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {user ? (
        <Avatar name={user.name} href="/profile" size="sm" />
      ) : (
        <Link
          to="/login"
          aria-label="Se connecter"
          className={cn(
            focusRing,
            "bg-primary text-primary-foreground grid size-8 place-items-center rounded-full",
          )}
        >
          <UserIcon className="size-4" />
        </Link>
      )}
    </div>
  );
}

function NavBar({ links, user, onSignOut, className }: Readonly<NavBarProps>) {
  return (
    <header data-slot="navbar" className={cn("bg-card border-b", className)}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-8">
        <Logo />
        <nav aria-label="Navigation principale" className="hidden gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={cn(
                focusRing,
                "hover:bg-secondary aria-[current=page]:bg-foreground aria-[current=page]:text-background rounded-full px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors",
              )}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <AccountMenu links={links} user={user} onSignOut={onSignOut} />
      </div>
    </header>
  );
}

export { NavBar, type NavBarLink };
