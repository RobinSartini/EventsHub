import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type IconButtonProps = Omit<ComponentProps<"button">, "aria-label"> & {
  "aria-label": string;
  variant?: "default" | "outline" | "primary";
  size?: "default" | "lg";
};

function IconButton({
  variant = "default",
  size = "default",
  className,
  type = "button",
  ...props
}: Readonly<IconButtonProps>) {
  return (
    <button
      type={type}
      data-slot="icon-button"
      data-variant={variant}
      data-size={size}
      className={cn(
        "bg-secondary text-foreground inline-flex size-11 shrink-0 items-center justify-center rounded-full [&_svg]:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

export { IconButton };
