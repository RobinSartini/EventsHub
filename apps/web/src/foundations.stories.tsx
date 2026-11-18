import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Fondations",
  tags: ["!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const COLORS = [
  { token: "background", text: "foreground", usage: "Fond de page" },
  { token: "card", text: "card-foreground", usage: "Cartes, barres, popovers" },
  { token: "primary", text: "primary-foreground", usage: "Actions principales, liens" },
  { token: "primary-soft", text: "foreground", usage: "Fond doux du bleu roi" },
  { token: "secondary", text: "secondary-foreground", usage: "Survol, fonds neutres" },
  { token: "muted-foreground", text: "background", usage: "Texte secondaire" },
  { token: "border", text: "foreground", usage: "Bordures, séparateurs" },
  { token: "signal", text: "signal-foreground", usage: "Accent, création" },
  { token: "signal-soft", text: "signal-text", usage: "Fond d'alerte douce" },
  { token: "sky", text: "foreground", usage: "Visuels d'événement" },
  { token: "live", text: "live-foreground", usage: "En direct" },
  { token: "success", text: "background", usage: "Confirmation" },
  { token: "destructive", text: "background", usage: "Erreur, annulation" },
];

export const Colors: Story = {
  name: "Couleurs",
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
      {COLORS.map(({ token, text, usage }) => (
        <div key={token} className="bg-card flex flex-col overflow-hidden rounded-2xl border">
          <div
            className="font-display grid h-20 place-items-center text-2xl font-extrabold"
            style={{ background: `var(--${token})`, color: `var(--${text})` }}
          >
            Aa
          </div>
          <div className="flex flex-col gap-0.5 p-3">
            <code className="font-mono text-xs font-bold">--{token}</code>
            <span className="text-muted-foreground text-xs">{usage}</span>
          </div>
        </div>
      ))}
    </div>
  ),
};

const FONTS = [
  { className: "font-display text-3xl font-extrabold", name: "Unbounded", usage: "Titres, logo" },
  { className: "font-sans text-base", name: "Nunito Sans", usage: "Texte courant, boutons" },
  { className: "font-mono text-sm", name: "JetBrains Mono", usage: "Dates, prix, codes" },
];

export const Typography: Story = {
  name: "Typographie",
  render: () => (
    <div className="flex flex-col gap-6">
      {FONTS.map(({ className, name, usage }) => (
        <div key={name} className="flex flex-col gap-1 border-b pb-6 last:border-b-0">
          <span className="text-muted-foreground text-xs font-bold">
            {name} - {usage}
          </span>
          <p className={className}>Tous les événements de ta ville, sam. 14 nov - 21:00 - 12 €</p>
        </div>
      ))}
    </div>
  ),
};
