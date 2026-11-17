import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { FavoriteButton } from "./favorite-button";

const meta = {
  component: FavoriteButton,
  args: { eventName: "Nuit Fluo", isFavorite: false, onToggle: fn() },
} satisfies Meta<typeof FavoriteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotFavorite: Story = { name: "Pas en favori" };

export const Favorite: Story = { name: "En favori", args: { isFavorite: true } };

export const OnEventPage: Story = {
  name: "Sur la fiche",
  args: { isFavorite: true, size: "lg" },
};
