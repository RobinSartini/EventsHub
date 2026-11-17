import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/foundations.stories.tsx",
    { directory: "../src/components", files: "**/*.stories.tsx", titlePrefix: "Composants" },
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-themes"],
  framework: "@storybook/react-vite",
  core: { disableTelemetry: true, disableWhatsNewNotifications: true },
  typescript: { reactDocgen: "react-docgen-typescript" },
  viteFinal: (config) => ({
    ...config,
    plugins: config.plugins?.flat().filter((plugin) => {
      const name = plugin && "name" in plugin ? plugin.name : "";
      return !name.startsWith("react-router");
    }),
  }),
};

export default config;
