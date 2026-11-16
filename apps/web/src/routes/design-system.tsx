import { type ReactNode, useState } from "react";

import { ArrowRightIcon, MinusIcon, PlusIcon, SearchIcon, Share2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { CapacityBar } from "@/components/ui/capacity-bar";
import { CheckboxField, CheckboxGroup } from "@/components/ui/checkbox";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { IconButton } from "@/components/ui/icon-button";
import { Chip, RemovableChip, SoftChip } from "@/components/ui/chip";
import { DateBadge } from "@/components/ui/date-badge";
import { LiveBadge } from "@/components/ui/live-badge";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { SearchBar, type SearchValues } from "@/components/ui/search-bar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

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

function useToggleList(initial: string[]) {
  const [items, setItems] = useState(initial);

  const toggle = (item: string, isOn: boolean) =>
    setItems((current) => (isOn ? [...current, item] : current.filter((i) => i !== item)));

  return [items, toggle] as const;
}

const CATEGORIES = ["Musique", "Théâtre", "Sport", "Expo"];

function ChipDemo() {
  const [selected, toggle] = useToggleList(["Musique"]);

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

const VIEWS = [
  { value: "list", label: "Liste" },
  { value: "map", label: "Carte" },
] as const;

function SegmentedControlDemo() {
  const [view, setView] = useState<(typeof VIEWS)[number]["value"]>("list");

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl label="Affichage" options={VIEWS} value={view} onValueChange={setView} />
      <p className="text-muted-foreground text-sm">
        Affichage : {view === "list" ? "la liste des événements" : "la carte"}
      </p>
    </div>
  );
}

function SwitchDemo() {
  const [accessible, setAccessible] = useState(true);
  const [reminder, setReminder] = useState(false);

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Switch label="Accessible PMR" checked={accessible} onCheckedChange={setAccessible} />
      <Switch label="Rappel une heure avant" checked={reminder} onCheckedChange={setReminder} />
      <Switch label="Places disponibles" checked={false} onCheckedChange={() => {}} disabled />
    </div>
  );
}

const CATEGORY_COUNTS = [
  { label: "Musique", count: 128 },
  { label: "Théâtre", count: 42 },
  { label: "Sport", count: 67 },
];

function CheckboxDemo() {
  const [checked, toggle] = useToggleList(["Musique"]);

  return (
    <CheckboxGroup legend="Catégories" className="w-full max-w-xs">
      {CATEGORY_COUNTS.map(({ label, count }) => (
        <CheckboxField
          key={label}
          label={label}
          count={count}
          checked={checked.includes(label)}
          onCheckedChange={(isChecked) => toggle(label, isChecked)}
        />
      ))}
    </CheckboxGroup>
  );
}

const SORTS = [
  { value: "date", label: "Date" },
  { value: "distance", label: "Distance" },
  { value: "popularity", label: "Popularité" },
  { value: "price", label: "Prix" },
] as const;

function SelectDemo() {
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("date");

  return <Select label="Trier par" options={SORTS} value={sort} onValueChange={setSort} />;
}

function SearchBarDemo() {
  const [lastSearch, setLastSearch] = useState<SearchValues | null>(null);

  return (
    <div className="flex w-full flex-col gap-3">
      <SearchBar defaultValues={{ city: "Lyon" }} onSearch={setLastSearch} />
      <p className="text-muted-foreground font-mono text-xs">
        {lastSearch
          ? `onSearch(${JSON.stringify(lastSearch)})`
          : "Lance une recherche pour voir ce qui est envoyé."}
      </p>
    </div>
  );
}

const TICKETS = [
  { label: "Standard", price: 24, max: 4 },
  { label: "Étudiant", price: 12.5, max: 2 },
  { label: "Solidaire", price: null, max: 2 },
];

function QuantityStepperDemo() {
  const [quantities, setQuantities] = useState<Record<string, number>>({ Standard: 1 });

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {TICKETS.map(({ label, price, max }) => (
        <QuantityStepper
          key={label}
          label={label}
          price={price}
          max={max}
          value={quantities[label] ?? 0}
          onValueChange={(value) => setQuantities((current) => ({ ...current, [label]: value }))}
        />
      ))}
    </div>
  );
}

function FavoriteButtonDemo() {
  const [favorites, setFavorites] = useState({ card: false, page: true });

  return (
    <>
      <FavoriteButton
        eventName="Nuit Fluo"
        isFavorite={favorites.card}
        onToggle={() => setFavorites((current) => ({ ...current, card: !current.card }))}
      />
      <FavoriteButton
        eventName="Nuit Fluo"
        size="lg"
        isFavorite={favorites.page}
        onToggle={() => setFavorites((current) => ({ ...current, page: !current.page }))}
      />
    </>
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
        title="Button"
        description="Une pilule pleine, un verbe, et c'est parti. L'icône se place avant le libellé pour créer, après pour avancer."
      >
        <Button>
          <SearchIcon data-icon="inline-start" />
          Rechercher
        </Button>
        <Button variant="accent">
          <PlusIcon data-icon="inline-start" />
          Créer un événement
        </Button>
        <Button variant="outline">Plus tard</Button>
        <Button variant="surface" size="sm">
          Voir la liste
        </Button>
        <Button disabled>Complet</Button>
        <Button size="lg">
          Réserver - 24 €
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </Section>

      <Section
        title="SegmentedControl"
        description="Liste ou Carte, jamais les deux : une seule option active à la fois."
      >
        <SegmentedControlDemo />
      </Section>

      <Section
        title="Switch"
        description="Pour ce qui s'applique tout de suite : un filtre, un rappel. Le libellé allume aussi l'interrupteur."
      >
        <SwitchDemo />
      </Section>

      <Section
        title="Checkbox"
        description="La case à cocher teintée de bleu roi, avec un compteur pour savoir où il y a du monde."
      >
        <CheckboxDemo />
      </Section>

      <Section
        title="Select"
        description="Trier par date, distance, popularité ou prix, sans quitter la pilule."
      >
        <SelectDemo />
      </Section>

      <Section
        title="SearchBar"
        description="Quoi, où, quand : trois questions, un bouton, et la soirée commence. Sur téléphone, les champs s'empilent."
      >
        <SearchBarDemo />
      </Section>

      <Section
        title="QuantityStepper"
        description="Combien de places ? Moins, plus, et le compteur suit. Plus passe en bleu roi dès qu'un billet est choisi."
      >
        <QuantityStepperDemo />
      </Section>

      <Section
        title="CapacityBar"
        description="La jauge qui crée l'envie : on voit la salle se remplir. À partir de 75 %, elle passe au rouge."
      >
        <div className="grid w-full max-w-sm gap-5">
          <CapacityBar taken={34} capacity={60} />
          <CapacityBar taken={62} capacity={80} />
          <CapacityBar taken={80} capacity={80} />
        </div>
      </Section>

      <Section
        title="IconButton"
        description="Un rond, une icône, une action. Son nom passe par aria-label, puisqu'il n'a pas de texte visible."
      >
        <IconButton aria-label="Retirer un billet">
          <MinusIcon />
        </IconButton>
        <IconButton aria-label="Ajouter un billet" variant="primary">
          <PlusIcon />
        </IconButton>
        <IconButton aria-label="Partager l'événement" variant="outline" size="lg">
          <Share2Icon />
        </IconButton>
      </Section>

      <Section
        title="FavoriteButton"
        description="Un cœur qui se remplit quand on aime. Sur la fiche, le fond rosit une fois l'événement sauvegardé."
      >
        <FavoriteButtonDemo />
      </Section>

      <Section
        title="Avatar"
        description="Des initiales dans un rond : bleu roi pour le profil, en négatif pour l'organisateur."
      >
        <Avatar name="Camille Bernard" href="/design-system" />
        <div className="flex items-center gap-3">
          <Avatar name="Lumière Collectif" size="lg" />
          <span className="font-bold">Lumière Collectif</span>
        </div>
      </Section>

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
