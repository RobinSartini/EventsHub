import { Link } from "react-router";

import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: readonly BreadcrumbItem[];
  className?: string;
};

function Breadcrumb({ items, className }: Readonly<BreadcrumbProps>) {
  return (
    <nav aria-label="Fil d'Ariane" data-slot="breadcrumb" className={className}>
      <ol className="text-muted-foreground flex flex-wrap gap-2 text-sm font-bold">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li
              key={`${index}-${item.label}`}
              className="flex gap-2 not-first:before:content-['/']"
            >
              {item.href && !isCurrent ? (
                <Link
                  to={item.href}
                  className={cn(focusRing, "hover:text-primary rounded-sm transition-colors")}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(isCurrent && "text-foreground")}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Breadcrumb, type BreadcrumbItem };
