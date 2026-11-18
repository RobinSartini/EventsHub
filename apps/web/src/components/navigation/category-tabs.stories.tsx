import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ActivityIcon,
  CompassIcon,
  GiftIcon,
  ImageIcon,
  MoonIcon,
  MusicIcon,
  PaletteIcon,
  TicketIcon,
  UtensilsIcon,
} from "lucide-react";
import { fn } from "storybook/test";

import { CategoryTabs } from "./category-tabs";

const meta = {
  component: CategoryTabs,
  args: {
    categories: [
      { value: "all", label: "Tout", icon: CompassIcon },
      { value: "tonight", label: "Ce soir", icon: MoonIcon },
      { value: "music", label: "Musique", icon: MusicIcon },
      { value: "workshops", label: "Ateliers", icon: PaletteIcon },
      { value: "sport", label: "Sport", icon: ActivityIcon },
      { value: "conventions", label: "Conventions", icon: TicketIcon },
      { value: "expos", label: "Expos", icon: ImageIcon },
      { value: "food", label: "Food", icon: UtensilsIcon },
      { value: "free", label: "Gratuit", icon: GiftIcon },
    ],
    value: "all",
    onValueChange: fn(),
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof CategoryTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Par défaut" };

export const MusicSelected: Story = { name: "Musique choisie", args: { value: "music" } };
