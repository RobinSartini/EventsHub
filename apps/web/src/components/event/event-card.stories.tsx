import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { EventCard } from "./event-card";

const meta = {
  component: EventCard,
  args: {
    event: {
      id: "nuit-fluo",
      name: "Nuit Fluo",
      startDate: "2026-11-14T20:00:00Z",
      location: "Les Docks",
      priceCents: 1200,
    },
    isFavorite: true,
    onToggleFavorite: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Par défaut" };

export const Free: Story = {
  name: "Gratuit",
  args: {
    event: {
      id: "expo-lumiere",
      name: "Expo Lumière",
      startDate: "2026-11-21T09:00:00Z",
      location: "Halle Tony Garnier",
      priceCents: 0,
    },
    isFavorite: false,
  },
};

export const Cancelled: Story = {
  name: "Annulé",
  args: {
    event: {
      id: "atelier-ceramique",
      name: "Atelier céramique",
      startDate: "2026-11-22T13:00:00Z",
      location: "La Croix-Rousse",
      priceCents: 3500,
      status: "cancelled",
    },
    isFavorite: false,
  },
};

export const WithDistance: Story = {
  name: "Avec la distance",
  args: {
    event: {
      id: "soiree-jazz",
      name: "Soirée jazz",
      startDate: "2026-11-29T19:00:00Z",
      location: "Le Cargo, Valence",
      priceCents: 1000,
      distanceKm: 2.4,
    },
    isFavorite: false,
  },
};
