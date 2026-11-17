import { Link } from "react-router";

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
    <nav aria-label="Fil d'Ariane" data-slot="breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex gap-2">
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className="font-bold">
                  {item.label}
                </span>
              ) : (
                <Link to={item.href} className="text-muted-foreground">
                  {item.label}
                </Link>
              )}
              {isLast ? null : <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Breadcrumb, type BreadcrumbItem };
