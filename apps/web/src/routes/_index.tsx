import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CheckboxField, CheckboxGroup } from "@/components/ui/checkbox";
import { RemovableChip } from "@/components/ui/chip";
import type { EventCardEvent } from "@/components/ui/event-card";
import { EventCard } from "@/components/ui/event-card";
import type { MapMarker } from "@/components/ui/events-map";
import { EventsMap } from "@/components/ui/events-map";
import { RangeSlider } from "@/components/ui/range-slider";
import { SearchBar } from "@/components/ui/search-bar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatPrice } from "@/lib/format-price";

const MOCK_EVENTS: EventCardEvent[] = [
  {
    id: "1",
    name: "Nuit Fluo",
    startDate: "2026-11-14T20:00:00Z",
    location: "Les Docks · 1,2 km",
    capacity: 60,
    ticketsSold: 32,
    status: "published",
  },
  {
    id: "2",
    name: "Jam session acoustique",
    startDate: "2026-11-13T19:30:00Z",
    location: "Studio 26 · 2,1 km",
    capacity: 26,
    ticketsSold: 0,
    status: "published",
  },
  {
    id: "3",
    name: "Soirée salsa",
    startDate: "2026-11-12T19:30:00Z",
    location: "Salle Tempo · 3,4 km",
    capacity: 80,
    ticketsSold: 75,
    status: "published",
  },
  {
    id: "4",
    name: "Atelier DJ débutant",
    startDate: "2026-11-14T14:00:00Z",
    location: "Studio 26 · 900 m",
    capacity: 10,
    ticketsSold: 6,
    status: "published",
  },
  {
    id: "5",
    name: "Blind test années 2000",
    startDate: "2026-11-13T21:00:00Z",
    location: "Le Comptoir · 600 m",
    capacity: 50,
    ticketsSold: 0,
    status: "published",
  },
  {
    id: "6",
    name: "Open mic",
    startDate: "2026-11-15T18:00:00Z",
    location: "Café des Arts · 1,8 km",
    capacity: 18,
    ticketsSold: 0,
    status: "published",
  },
];

const CATEGORIES = [
  { label: "Musique", count: 12 },
  { label: "Ateliers", count: 8 },
  { label: "Sport", count: 4 },
  { label: "Conventions", count: 3 },
  { label: "Expos", count: 9 },
  { label: "Food & boissons", count: 10 },
];

const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "distance", label: "Distance" },
  { value: "relevance", label: "Pertinence" },
] as const;

type SortValue = "date" | "distance" | "relevance";

const VIEW_OPTIONS = [
  { value: "list", label: "Liste" },
  { value: "list-map", label: "Liste + carte" },
] as const;

type ViewValue = "list" | "list-map";

const MOCK_MARKERS: MapMarker[] = [
  { id: "1", lat: 44.937, lng: 4.882, label: formatPrice(12) },
  { id: "2", lat: 44.93, lng: 4.896, label: formatPrice(8) },
  { id: "3", lat: 44.928, lng: 4.904, label: formatPrice(null), free: true },
  { id: "4", lat: 44.935, lng: 4.912, label: formatPrice(15) },
  { id: "5", lat: 44.924, lng: 4.887, label: formatPrice(null), free: true },
  { id: "6", lat: 44.941, lng: 4.899, label: formatPrice(null), free: true },
];

const CITY = "Valence";
const TOTAL_RESULTS = 48;
const RADIUS_KM = 10;

export function meta() {
  return [
    { title: "Événements – EventsHub" },
    { name: "description", content: `Découvrez les événements autour de ${CITY}` },
  ];
}

export default function Home() {
  const [view, setView] = useState<ViewValue>("list-map");
  const [sortBy, setSortBy] = useState<SortValue>("date");
  const [priceMax, setPriceMax] = useState(15);
  const [freeOnly, setFreeOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [accessible, setAccessible] = useState(false);
  const [kidsAdapted, setKidsAdapted] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Musique"]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  function toggleCategory(label: string, checked: boolean) {
    setSelectedCategories((prev) => (checked ? [...prev, label] : prev.filter((c) => c !== label)));
  }

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const activeFilters = [
    ...selectedCategories.map((c) => ({
      key: `cat-${c}`,
      label: c,
      onRemove: () => toggleCategory(c, false),
    })),
    ...(priceMax < 50
      ? [{ key: "price", label: `≤ ${priceMax} €`, onRemove: () => setPriceMax(50) }]
      : []),
    ...(availableOnly
      ? [{ key: "available", label: "Places disponibles", onRemove: () => setAvailableOnly(false) }]
      : []),
  ];

  function clearAllFilters() {
    setSelectedCategories([]);
    setPriceMax(50);
    setFreeOnly(false);
    setAvailableOnly(false);
    setAccessible(false);
    setKidsAdapted(false);
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto px-10 py-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
              Événements autour de <span className="text-primary">{CITY}</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {TOTAL_RESULTS} résultats · cette semaine · dans un rayon de {RADIUS_KM} km
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 pt-1">
            <Select
              label="Trier par"
              options={SORT_OPTIONS}
              value={sortBy}
              onValueChange={setSortBy}
            />
            <SegmentedControl
              label="Affichage"
              options={VIEW_OPTIONS}
              value={view}
              onValueChange={setView}
            />
          </div>
        </div>

        <SearchBar defaultValues={{ city: CITY }} onSearch={() => {}} className="mb-4" />

        {activeFilters.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm font-bold">Filtres actifs :</span>
            {activeFilters.map((filter) => (
              <RemovableChip key={filter.key} label={filter.label} onRemove={filter.onRemove} />
            ))}
            <Button variant="link" size="sm" onClick={clearAllFilters}>
              Tout effacer
            </Button>
          </div>
        )}

        <div className="grid grid-cols-[220px_1fr] gap-6">
          <aside className="flex flex-col gap-6">
            <CheckboxGroup legend="Catégories">
              {CATEGORIES.map(({ label, count }) => (
                <CheckboxField
                  key={label}
                  checked={selectedCategories.includes(label)}
                  onCheckedChange={(checked) => toggleCategory(label, checked)}
                  label={label}
                  count={count}
                />
              ))}
            </CheckboxGroup>

            <RangeSlider
              label="Prix max"
              min={0}
              max={50}
              step={1}
              value={priceMax}
              onValueChange={setPriceMax}
              format={(v) => formatPrice(v === 0 ? null : v)}
            />

            <CheckboxField
              checked={freeOnly}
              onCheckedChange={setFreeOnly}
              label="Gratuit uniquement"
            />

            <div className="flex flex-col gap-3">
              <Switch
                label="Places disponibles"
                checked={availableOnly}
                onCheckedChange={setAvailableOnly}
              />
              <Switch label="Accessible PMR" checked={accessible} onCheckedChange={setAccessible} />
              <Switch
                label="Adapté aux enfants"
                checked={kidsAdapted}
                onCheckedChange={setKidsAdapted}
              />
            </div>
          </aside>

          <main>
            <div className="grid grid-cols-2 gap-4">
              {MOCK_EVENTS.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isFavorite={favorites.has(event.id)}
                  onToggleFavorite={() => toggleFavorite(event.id)}
                />
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Button variant="outline">
                Voir {TOTAL_RESULTS - MOCK_EVENTS.length} événements de plus
              </Button>
            </div>
          </main>
        </div>
      </div>

      {view === "list-map" && (
        <aside className="w-[420px] shrink-0 py-6 pr-10">
          <EventsMap markers={MOCK_MARKERS} className="h-full w-full rounded-2xl overflow-hidden" />
        </aside>
      )}
    </div>
  );
}
