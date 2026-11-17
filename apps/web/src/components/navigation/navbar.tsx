import { MenuIcon, UserIcon } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { Link } from "react-router";

import { useDarkTheme } from "@/components/theme-switch";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "./logo";

type NavBarLink = {
  to: string;
  label: string;
};

type NavBarProps = {
  links?: readonly NavBarLink[];
  user: { name: string } | null;
  onSignOut: () => void;
  className?: string;
  children?: ReactNode;
};

const menuItem = "rounded-xl px-3 py-2.5 text-sm font-bold";

function AccountMenu({
  links = [],
  user,
  onSignOut,
}: Readonly<Omit<NavBarProps, "className" | "children">>) {
  const [dark, setDark] = useDarkTheme();
  const pill = useRef<HTMLDivElement>(null);
  const linkItem = (to: string, label: string) => (
    <DropdownMenuItem key={to} className={menuItem} render={<Link to={to} />}>
      {label}
    </DropdownMenuItem>
  );

  return (
    <div ref={pill} className="flex items-center gap-1 rounded-full border p-1 pl-2">
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
          anchor={pill}
          align="end"
          sideOffset={8}
          className="bg-card shadow-float w-60 rounded-3xl p-2 ring-0"
        >
          {links.map((link) => linkItem(link.to, link.label))}
          {links.length > 0 ? <DropdownMenuSeparator className="my-1" /> : null}
          <DropdownMenuCheckboxItem className={menuItem} checked={dark} onCheckedChange={setDark}>
            Thème sombre
          </DropdownMenuCheckboxItem>
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

function NavBar({ links, user, onSignOut, className, children }: Readonly<NavBarProps>) {
  return (
    <header data-slot="navbar" className={cn("bg-card border-b", className)}>
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 md:px-10 lg:flex-nowrap",
          children ? "pt-5 pb-3" : "py-3",
        )}
      >
        <Logo />
        {children ? (
          <div className="order-last flex w-full justify-center lg:order-none lg:w-auto lg:flex-1">
            {children}
          </div>
        ) : null}
        <AccountMenu links={links} user={user} onSignOut={onSignOut} />
      </div>
    </header>
  );
}

export { NavBar, type NavBarLink };
