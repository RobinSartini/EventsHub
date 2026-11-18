import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Select } from "./select";

const meta = {
  component: Select,
  args: {
    label: "Trier par",
    options: [
      { value: "date", label: "Date" },
      { value: "distance", label: "Distance" },
      { value: "popularity", label: "Popularité" },
      { value: "price", label: "Prix" },
    ],
    value: "date",
    onValueChange: fn(),
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Par défaut" };
