import { type ReactNode, useState } from "react";

import { Chip, RemovableChip, SoftChip } from "@/components/ui/chip";
import { DateBadge } from "@/components/ui/date-badge";
import { LiveBadge } from "@/components/ui/live-badge";

export function meta() {
  return [{ title: "Design system - EventsHub" }];
}

function Section({
  title,
  description,
  children,
}: Readonly<{ title: string; description: string; children: ReactNode }>) {
  return (
    <section className="border-border flex flex-col gap-4 border-b py-8 last:border-b-0">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="text-muted-foreground max-w-prose text-sm">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  );
}

const CATEGORIES = ["Musique", "Théâtre", "Sport", "Expo"];

function ChipDemo() {
  const [selected, setSelected] = useState<string[]>(["Musique"]);

  const toggle = (category: string, isSelected: boolean) =>
    setSelected((current) =>
      isSelected ? [...current, category] : current.filter((c) => c !== category),
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <Chip
            key={category}
            selected={selected.includes(category)}
            onSelectedChange={(isSelected) => toggle(category, isSelected)}
          >
            {category}
          </Chip>
        ))}
      </div>
      <div className="flex min-h-9 flex-wrap items-center gap-2">
        {selected.map((category) => (
          <RemovableChip key={category} label={category} onRemove={() => toggle(category, false)} />
        ))}
        <SoftChip>Gratuit</SoftChip>
      </div>
    </div>
  );
}

export default function DesignSystem() {
  return (
    <main className="mx-auto w-full max-w-[1360px] px-4 py-10 sm:px-6 lg:px-10">
      <header className="flex flex-col gap-2 pb-4">
        <p className="text-signal-text font-mono text-xs font-bold uppercase">EventsHub</p>
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Design system</h1>
        <p className="text-muted-foreground max-w-prose">
          Les composants du site, tels qu'ils s'affichent. Le bouton de thème en haut à droite
          bascule entre clair et sombre.
        </p>
      </header>

      <Section
        title="DateBadge"
        description="La date d'un événement en un coup d'oeil, à l'heure de Paris."
      >
        <DateBadge date="2026-11-14T21:00:00Z" />
        <DateBadge date="2026-11-14T23:30:00Z" />
        <DateBadge date="2026-12-05T10:00:00Z" />
      </Section>

      <Section title="LiveBadge" description="Signale un événement en cours.">
        <LiveBadge />
        <LiveBadge detail="128 inscrits" />
      </Section>

      <Section
        title="Chip"
        description="Les petites pilules qui trient la ville : une catégorie à choisir, un filtre à retirer, une info douce."
      >
        <ChipDemo />
      </Section>

      <Section
        title="Sur une carte"
        description="Les badges posés sur le visuel d'un événement, comme dans la maquette."
      >
        <div className="bg-sky relative aspect-[4/3] w-full max-w-sm rounded-[26px_26px_26px_6px]">
          <DateBadge date="2026-11-14T21:00:00Z" className="absolute top-3 left-3" />
          <LiveBadge className="absolute right-3 bottom-3" />
        </div>
      </Section>
    </main>
  );
}
