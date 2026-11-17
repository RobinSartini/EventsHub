import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { SegmentedControl } from "./segmented-control";

const meta = {
  component: SegmentedControl,
  args: {
    label: "Affichage",
    options: [
      { value: "list", label: "Liste" },
      { value: "map", label: "Carte" },
    ],
    value: "list",
    onValueChange: fn(),
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = { name: "Liste choisie" };

export const Map: Story = { name: "Carte choisie", args: { value: "map" } };
