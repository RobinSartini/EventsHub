import { UserIcon } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { Link } from "react-router";

import { useDarkTheme } from "@/components/theme-switch";
import { focusRing, pageWidth } from "@/lib/styles";
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

const menuItem =
  "ease-signature px-4 py-3 text-sm font-bold transition-[color,translate] duration-200 focus:translate-x-1 focus:bg-transparent focus:text-primary";
const burgerLine =
  "ease-signature absolute h-0.5 w-[18px] rounded-full bg-current transition-[translate,rotate,opacity] duration-300";

function BurgerIcon() {
  return (
    <span aria-hidden="true" className="relative grid size-5 place-items-center">
      <span
        className={cn(
          burgerLine,
          "-translate-y-1.5 group-data-popup-open/burger:translate-y-0 group-data-popup-open/burger:rotate-45",
        )}
      />
      <span className={cn(burgerLine, "group-data-popup-open/burger:opacity-0")} />
      <span
        className={cn(
          burgerLine,
          "translate-y-1.5 group-data-popup-open/burger:translate-y-0 group-data-popup-open/burger:-rotate-45",
        )}
      />
    </span>
  );
}

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
    <div
      ref={pill}
      className="hover:shadow-raised has-[[data-popup-open]]:shadow-raised flex items-center gap-1 justify-self-end rounded-full border p-1 pl-2 transition-shadow duration-300"
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Menu"
          className={cn(
            focusRing,
            "group/burger hover:text-primary data-popup-open:text-primary grid size-8 place-items-center rounded-full transition-colors",
          )}
        >
          <BurgerIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          anchor={pill}
          align="end"
          sideOffset={8}
          className="bg-card shadow-float rounded-card rounded-tr-anchor w-60 p-2 ring-0"
        >
          {links.map((link) => linkItem(link.to, link.label))}
          {links.length > 0 ? <DropdownMenuSeparator className="mx-4 my-1" /> : null}
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
          pageWidth,
          "flex flex-wrap items-center justify-between gap-x-6 gap-y-3",
          children ? "pt-6 pb-3 lg:grid lg:grid-cols-[1fr_auto_1fr]" : "py-3",
        )}
      >
        <Logo />
        {children ? (
          <div className="order-last flex w-full justify-center lg:order-none lg:w-[40rem]">
            {children}
          </div>
        ) : null}
        <AccountMenu links={links} user={user} onSignOut={onSignOut} />
      </div>
    </header>
  );
}

export { NavBar };
