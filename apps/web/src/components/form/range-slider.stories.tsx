import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { formatPrice } from "@/lib/format-price";

import { RangeSlider } from "./range-slider";

const meta = {
  component: RangeSlider,
  args: {
    label: "Prix max",
    min: 0,
    max: 50,
    value: 15,
    format: (value: number) => formatPrice(value),
    onValueChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Price: Story = { name: "Prix" };

export const Radius: Story = {
  name: "Rayon",
  args: { label: "Rayon", min: 1, value: 10, format: (km: number) => `${km} km` },
};
