import type { ComponentProps } from "react";

import { Button } from "./button";

type IconButtonProps = Omit<ComponentProps<typeof Button>, "aria-label" | "variant" | "size"> & {
  "aria-label": string;
  variant?: "default" | "outline" | "primary" | "ghost";
  size?: "default" | "lg";
};

const variants = {
  default: "secondary",
  outline: "outline",
  primary: "default",
  ghost: "ghost",
} as const;
const sizes = { default: "icon", lg: "icon-lg" } as const;

function IconButton({
  variant = "default",
  size = "default",
  ...props
}: Readonly<IconButtonProps>) {
  return (
    <Button
      data-slot="icon-button"
      data-size={size}
      variant={variants[variant]}
      size={sizes[size]}
      {...props}
    />
  );
}

export { IconButton };
