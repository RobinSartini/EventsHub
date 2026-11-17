import { fromIsoDay, toIsoDay } from "./format-date";

// Pseudo-catégorie de l'accueil : les événements du jour, via from/to du contrat.
export const TONIGHT = "ce-soir";
export const PAGE_SIZE = 12;
const MAX_LENGTH = 100;

type HomeFilters = {
  q?: string;
  city?: string;
  from?: string;
  category?: string;
};

function text(value: string | null): string | undefined {
  return value?.trim().slice(0, MAX_LENGTH) || undefined;
}

export function readHomeSearch(params: URLSearchParams): HomeFilters {
  const from = params.get("from") ?? undefined;

  return {
    q: text(params.get("q")),
    city: text(params.get("city")),
    from: fromIsoDay(from) ? from : undefined,
    category: text(params.get("category")),
  };
}

export function writeHomeSearch(fields: HomeFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value) params.set(key, value);
  }
  return params;
}

export function eventsQuery({ category, from, ...search }: HomeFilters, today: Date, page: number) {
  const tonight = category === TONIGHT ? toIsoDay(today) : undefined;
  const params = writeHomeSearch({
    q: search.q,
    city: search.city,
    from: tonight ?? from,
    category: tonight ? undefined : category,
  });

  if (tonight) params.set("to", tonight);
  params.set("page", String(page));
  params.set("pageSize", String(PAGE_SIZE));
  return params.toString();
}

type LoadedPage = { events: readonly unknown[]; total: number };

// Page suivante pour « Afficher plus », ou undefined quand tout est chargé.
export function nextPage(pages: readonly LoadedPage[]): number | undefined {
  const last = pages.at(-1);
  const loaded = pages.reduce((count, page) => count + page.events.length, 0);
  if (!last?.events.length || loaded >= last.total) return undefined;
  return pages.length + 1;
}
