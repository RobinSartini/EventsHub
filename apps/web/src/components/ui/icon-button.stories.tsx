import type { Meta, StoryObj } from "@storybook/react-vite";
import { MinusIcon, PlusIcon, Share2Icon } from "lucide-react";

import { IconButton } from "./icon-button";

const meta = {
  component: IconButton,
  args: { "aria-label": "Retirer un billet", children: <MinusIcon /> },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Par défaut" };

export const Primary: Story = {
  name: "Principal",
  args: { "aria-label": "Ajouter un billet", variant: "primary", children: <PlusIcon /> },
};

export const OutlineLarge: Story = {
  name: "Contour, grand",
  args: {
    "aria-label": "Partager l'événement",
    variant: "outline",
    size: "lg",
    children: <Share2Icon />,
  },
};
