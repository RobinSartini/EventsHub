import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Switch } from "./switch";

const meta = {
  component: Switch,
  args: { label: "Accessible PMR", checked: true, onCheckedChange: fn() },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = { name: "Allumé" };

export const Off: Story = { name: "Éteint", args: { checked: false } };

export const Disabled: Story = {
  name: "Désactivé",
  args: { label: "Places disponibles", checked: false, disabled: true },
};
