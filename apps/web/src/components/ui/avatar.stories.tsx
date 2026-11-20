import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar } from "./avatar";

const meta = {
  component: Avatar,
  args: { name: "Camille Bernard" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Par défaut" };

export const ProfileLink: Story = { name: "Lien vers le profil", args: { href: "/profile" } };

export const Organizer: Story = {
  name: "Organisateur",
  args: { name: "Lumière Collectif", size: "lg" },
};

export const Small: Story = { name: "Petit", args: { size: "sm" } };

export const WithoutName: Story = { name: "Sans nom", args: { name: "", href: "/profile" } };
