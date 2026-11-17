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
  const lastIndex = items.length - 1;

  return (
    <nav aria-label="Fil d'Ariane" data-slot="breadcrumb" className={className}>
      <ol className="text-muted-foreground flex flex-wrap gap-2 text-sm font-bold">
        {items.map((item, index) => (
          <li key={`${index}-${item.label}`} className="flex gap-2 not-first:before:content-['/']">
            {index < lastIndex && item.href ? (
              <Link
                to={item.href}
                className={cn(focusRing, "hover:text-foreground rounded-sm transition-colors")}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={index === lastIndex ? "page" : undefined}
                className={cn(index === lastIndex && "text-foreground")}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export { Breadcrumb, type BreadcrumbItem };
