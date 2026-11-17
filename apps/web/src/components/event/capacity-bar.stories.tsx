import type { Meta, StoryObj } from "@storybook/react-vite";

import { CapacityBar } from "./capacity-bar";

const meta = {
  component: CapacityBar,
  args: { taken: 34, capacity: 60 },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CapacityBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = { name: "Places disponibles" };

export const AlmostFull: Story = { name: "Bientôt complet", args: { taken: 62, capacity: 80 } };

export const Full: Story = { name: "Complet", args: { taken: 80, capacity: 80 } };
