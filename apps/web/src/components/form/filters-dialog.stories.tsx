import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { FiltersDialog } from "./filters-dialog";

const meta = {
  component: FiltersDialog,
  args: { sort: "date", onApply: fn() },
} satisfies Meta<typeof FiltersDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ByDate: Story = { name: "Tri par date" };

export const ByDistance: Story = {
  name: "Tri par distance, un filtre actif",
  args: { sort: "distance" },
};
