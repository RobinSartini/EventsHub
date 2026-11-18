import type { Meta, StoryObj } from "@storybook/react-vite";

import { LiveBadge } from "./live-badge";

const meta = {
  component: LiveBadge,
} satisfies Meta<typeof LiveBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Par défaut" };

export const WithDetail: Story = { name: "Avec détail", args: { detail: "128 inscrits" } };
