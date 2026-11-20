import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { SearchBar } from "./search-bar";

const meta = {
  component: SearchBar,
  args: { onSearch: fn() },
  parameters: { layout: "padded" },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { name: "Vide" };

export const Prefilled: Story = {
  name: "Préremplie",
  args: { defaultValues: { q: "concert", city: "Lyon", from: "2026-11-20" } },
};
