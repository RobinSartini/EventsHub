import type { Meta, StoryObj } from "@storybook/react-vite";

import { Breadcrumb } from "./breadcrumb";

const meta = {
  component: Breadcrumb,
  args: {
    items: [
      { label: "Explorer", href: "/" },
      { label: "Musique", href: "/?category=music" },
      { label: "Nuit Fluo" },
    ],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Par défaut" };
