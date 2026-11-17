import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { CheckboxField, CheckboxGroup } from "./checkbox";

const meta = {
  component: CheckboxField,
  args: { label: "Musique", count: 128, checked: true, onCheckedChange: fn() },
} satisfies Meta<typeof CheckboxField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Checked: Story = { name: "Cochée" };

export const Unchecked: Story = { name: "Décochée", args: { checked: false } };

export const Group: Story = {
  name: "Groupe",
  render: () => (
    <CheckboxGroup legend="Catégories" className="w-72">
      <CheckboxField label="Musique" count={128} checked onCheckedChange={fn()} />
      <CheckboxField label="Théâtre" count={42} checked={false} onCheckedChange={fn()} />
      <CheckboxField label="Sport" count={67} checked={false} onCheckedChange={fn()} />
    </CheckboxGroup>
  ),
};
