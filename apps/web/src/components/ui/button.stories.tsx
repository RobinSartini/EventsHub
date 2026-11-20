import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRightIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Button } from "./button";

const meta = {
  component: Button,
  args: { children: "Rechercher" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  name: "Principal",
  args: {
    children: (
      <>
        <SearchIcon data-icon="inline-start" />
        Rechercher
      </>
    ),
  },
};

export const Accent: Story = {
  name: "Accent",
  args: {
    variant: "accent",
    children: (
      <>
        <PlusIcon data-icon="inline-start" />
        Créer un événement
      </>
    ),
  },
};

export const Outline: Story = {
  name: "Contour",
  args: { variant: "outline", children: "Plus tard" },
};

export const Link: Story = {
  name: "Lien",
  args: { variant: "link", size: "sm", children: "Tout effacer" },
};

export const Surface: Story = {
  name: "Surface",
  args: { variant: "surface", size: "sm", children: "Voir la liste" },
};

export const Large: Story = {
  name: "Grand",
  args: {
    size: "lg",
    children: (
      <>
        Réserver - 24 €
        <ArrowRightIcon data-icon="inline-end" />
      </>
    ),
  },
};

export const Disabled: Story = { name: "Désactivé", args: { disabled: true, children: "Complet" } };
