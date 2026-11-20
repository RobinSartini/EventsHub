import type { Meta, StoryObj } from "@storybook/react-vite";

import { DateBadge } from "./date-badge";

const meta = {
  component: DateBadge,
  args: { date: "2026-11-14T21:00:00Z" },
} satisfies Meta<typeof DateBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Par défaut" };

export const NextDayInParis: Story = {
  name: "Lendemain à Paris",
  args: { date: "2026-11-14T23:30:00Z" },
};
