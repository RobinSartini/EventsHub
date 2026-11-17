import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  BikeIcon,
  DramaIcon,
  LayoutGridIcon,
  type LucideIcon,
  MoonStarIcon,
  MusicIcon,
  PaletteIcon,
  SparklesIcon,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { EventCard, type EventCardEvent } from "@/components/event/event-card";
import { SearchBar, type SearchValues } from "@/components/form/search-bar";
import { CategoryTabs } from "@/components/navigation/category-tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type ApiEvent, fetchCategories, fetchEvents } from "@/lib/events-api";
import {
  eventsQuery,
  type HomeSearch,
  PAGE_SIZE,
  readHomeSearch,
  TONIGHT,
  writeHomeSearch,
} from "@/lib/home-search";
import { plural } from "@/lib/plural";

const ALL = "all";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  atelier: PaletteIcon,
  musique: MusicIcon,
  sport: BikeIcon,
  theatre: DramaIcon,
};

const FIXED_TABS = [
  { value: ALL, label: "Tout", icon: LayoutGridIcon },
  { value: TONIGHT, label: "Ce soir", icon: MoonStarIcon },
];

export function meta() {
  return [
    { title: "Événements - EventsHub" },
    { name: "description", content: "Tous les événements près de chez toi" },
  ];
}

function toCardEvent({ location, city, ...event }: ApiEvent): EventCardEvent {
  const place = [location, city].filter(
    (part, index, parts) => part && parts.indexOf(part) === index,
  );
  return { ...event, location: place.join(", ") || undefined };
}

function Pagination({ search, pageCount }: Readonly<{ search: HomeSearch; pageCount: number }>) {
  if (pageCount <= 1) return null;
  const pageLink = (page: number) => ({ search: writeHomeSearch({ ...search, page }).toString() });

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4">
      {search.page > 1 ? (
        <Link to={pageLink(search.page - 1)} className={buttonVariants({ variant: "outline" })}>
          Page précédente
        </Link>
      ) : null}
      <span className="text-muted-foreground text-sm font-bold">
        Page {search.page} sur {pageCount}
      </span>
      {search.page < pageCount ? (
        <Link to={pageLink(search.page + 1)} className={buttonVariants({ variant: "outline" })}>
          Page suivante
        </Link>
      ) : null}
    </nav>
  );
}

export default function Home() {
  const [params, setParams] = useSearchParams();
  const search = readHomeSearch(params);
  const query = eventsQuery(search, new Date());

  const events = useQuery({
    queryKey: ["events", query],
    queryFn: ({ signal }) => fetchEvents(query, signal),
    placeholderData: keepPreviousData,
    meta: { silent: true },
  });
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => fetchCategories(signal),
    staleTime: Number.POSITIVE_INFINITY,
    meta: { silent: true },
  });

  const tabs = [
    ...FIXED_TABS,
    ...(categories.data ?? []).map(({ slug, name }) => ({
      value: slug,
      label: name,
      icon: CATEGORY_ICONS[slug] ?? SparklesIcon,
    })),
  ];
  const hasFilters = Boolean(search.q || search.city || search.from || search.category);
  const total = events.data?.total ?? 0;

  const onSearch = (values: SearchValues) =>
    setParams(writeHomeSearch({ ...values, category: search.category }));
  const onCategory = (category: string) =>
    setParams(
      writeHomeSearch({ ...search, category: category === ALL ? undefined : category, page: 1 }),
    );
  const clearAll = () => setParams(new URLSearchParams());

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-10">
      <SearchBar
        key={[search.q, search.city, search.from].join("|")}
        defaultValues={search}
        onSearch={onSearch}
        className="self-center"
      />
      <CategoryTabs
        categories={tabs}
        value={search.category ?? ALL}
        onValueChange={onCategory}
        className="border-b"
      />

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-2xl font-extrabold">
          {search.city ? `Événements à ${search.city}` : "Événements à venir"}
        </h1>
        <div className="flex items-baseline gap-4">
          <p aria-live="polite" className="text-muted-foreground text-sm font-bold">
            {events.data ? `${total} ${plural(total, "événement")}` : null}
          </p>
          {hasFilters ? (
            <Button variant="link" size="sm" onClick={clearAll}>
              Tout effacer
            </Button>
          ) : null}
        </div>
      </div>

      {events.isError && !events.data ? (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p>Une erreur est survenue pendant le chargement des événements.</p>
          <Button variant="outline" onClick={() => events.refetch()}>
            Réessayer
          </Button>
        </div>
      ) : null}

      {events.isPending ? (
        <div aria-hidden="true" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-72 rounded-card" />
          ))}
        </div>
      ) : null}

      {events.data?.events.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">
          Aucun événement ne correspond à ta recherche.
        </p>
      ) : null}

      {events.data?.events.length ? (
        <ul
          aria-busy={events.isPlaceholderData}
          className="grid gap-6 transition-opacity aria-busy:opacity-60 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {events.data.events.map((event) => (
            <li key={event.id}>
              <EventCard event={toCardEvent(event)} className="h-full" />
            </li>
          ))}
        </ul>
      ) : null}

      <Pagination search={search} pageCount={Math.ceil(total / PAGE_SIZE)} />
    </main>
  );
}
