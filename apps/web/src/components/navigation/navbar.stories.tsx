import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { NavBar } from "./navbar";

const meta = {
  component: NavBar,
  args: { links: [{ to: "/", label: "Explorer" }], user: null, onSignOut: fn() },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = { name: "Sans session" };

export const SignedIn: Story = { name: "Connecté", args: { user: { name: "Camille Bernard" } } };
