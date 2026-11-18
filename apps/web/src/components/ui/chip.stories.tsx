import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Chip, RemovableChip, SoftChip } from "./chip";

const meta = {
  component: Chip,
  args: { children: "Musique", selected: true, onSelectedChange: fn() },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Selected: Story = { name: "Choisi" };

export const NotSelected: Story = { name: "Pas choisi", args: { selected: false } };

export const Removable: Story = {
  name: "Filtre à retirer",
  render: () => <RemovableChip label="Musique" onRemove={fn()} />,
};

export const Soft: Story = { name: "Info douce", render: () => <SoftChip>Gratuit</SoftChip> };
