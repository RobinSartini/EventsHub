import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
import { useSearchParams } from "react-router";

import { EventCard, type EventCardEvent } from "@/components/event/event-card";
import { CategoryTabs } from "@/components/navigation/category-tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type ApiEvent, fetchCategories, fetchEvents } from "@/lib/events-api";
import {
  eventsQuery,
  nextPage,
  PAGE_SIZE,
  readHomeSearch,
  TONIGHT,
  writeHomeSearch,
} from "@/lib/home-search";
import { plural } from "@/lib/plural";
import { cn } from "@/lib/utils";

const ALL = "all";
const grid = "grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

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
  const place = location === city ? location : [location, city].filter(Boolean).join(", ");
  return { ...event, location: place || undefined };
}

export default function Home() {
  const [params, setParams] = useSearchParams();
  const search = readHomeSearch(params);
  const today = new Date();

  const events = useInfiniteQuery({
    queryKey: ["events", eventsQuery(search, today, 1)],
    queryFn: ({ pageParam, signal }) => fetchEvents(eventsQuery(search, today, pageParam), signal),
    initialPageParam: 1,
    getNextPageParam: (_last, pages) => nextPage(pages),
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
  const hasFilters = Object.values(search).some(Boolean);
  const list = events.data?.pages.flatMap((page) => page.events) ?? [];
  const total = events.data?.pages[0]?.total ?? 0;
  const remaining = total - list.length;

  const onCategory = (category: string) =>
    setParams(writeHomeSearch({ ...search, category: category === ALL ? undefined : category }));
  const clearAll = () => setParams(new URLSearchParams());

  return (
    <div>
      <div className="bg-card border-b px-4 md:px-8">
        <CategoryTabs categories={tabs} value={search.category ?? ALL} onValueChange={onCategory} />
      </div>

      <main className="flex flex-col gap-6 px-4 py-8 md:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h1 aria-live="polite" className="font-display text-3xl font-extrabold md:text-4xl">
            {events.data ? `${total} ${plural(total, "événement")}` : "Événements"}
            {search.city ? (
              <>
                {" à "}
                <span className="text-primary">{search.city}</span>
              </>
            ) : (
              " à venir"
            )}
          </h1>
          <div className="flex items-baseline gap-4">
            <p className="text-muted-foreground text-sm font-bold">Triés par date</p>
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
          <div aria-hidden="true" className={grid}>
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <Skeleton
                key={index}
                className="aspect-[20/19] rounded-media rounded-bl-media-tail"
              />
            ))}
          </div>
        ) : null}

        {events.data && list.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center">
            Aucun événement ne correspond à ta recherche.
          </p>
        ) : null}

        {list.length > 0 ? (
          <ul
            aria-busy={events.isPlaceholderData}
            className={cn(grid, "transition-opacity aria-busy:opacity-60")}
          >
            {list.map((event) => (
              <li key={event.id}>
                <EventCard event={toCardEvent(event)} />
              </li>
            ))}
          </ul>
        ) : null}

        {events.hasNextPage ? (
          <div className="flex flex-col items-center gap-3 pt-4">
            <p className="text-muted-foreground text-sm font-bold">
              Encore {remaining} {plural(remaining, "événement")} à découvrir
            </p>
            <Button
              variant="outline"
              disabled={events.isFetchingNextPage}
              onClick={() => events.fetchNextPage()}
            >
              {events.isFetchingNextPage ? "Chargement" : "Afficher plus"}
            </Button>
            {events.isFetchNextPageError ? (
              <p role="alert" className="text-signal-text text-sm font-bold">
                Une erreur est survenue, réessaie.
              </p>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}
