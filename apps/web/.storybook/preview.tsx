import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";

import "../src/index.css";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { expanded: true },
  },
  decorators: [
    withThemeByClassName({ themes: { clair: "", sombre: "dark" }, defaultTheme: "sombre" }),
    (Story) => (
      <MemoryRouter>
        <div className="bg-background text-foreground rounded-2xl p-6">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default preview;
