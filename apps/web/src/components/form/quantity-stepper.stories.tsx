import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { QuantityStepper } from "./quantity-stepper";

const meta = {
  component: QuantityStepper,
  args: { label: "Standard", price: 24, value: 1, max: 4, onValueChange: fn() },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuantityStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Par défaut" };

export const Empty: Story = { name: "À zéro", args: { value: 0 } };

export const AtMax: Story = { name: "Au maximum", args: { value: 4 } };

export const Free: Story = { name: "Gratuit", args: { label: "Solidaire", price: null, value: 0 } };
