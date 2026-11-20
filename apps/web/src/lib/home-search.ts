import { fromIsoDay, toIsoDay } from "./format-date";

export const TONIGHT = "ce-soir";
export const PAGE_SIZE = 12;
const MAX_LENGTH = 100;

export type HomeFilters = {
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
  // Le jour envoyé est le jour local du navigateur, mais le serveur lit `from` et `to`
  // comme des jours UTC (00:00Z à 23:59Z). En France, « Ce soir » est donc décalé d'une
  // ou deux heures : un événement à 0h30 heure locale tombe dans le mauvais jour.
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

export function nextPage(pages: readonly LoadedPage[]): number | undefined {
  const last = pages.at(-1);
  const loaded = pages.reduce((count, page) => count + page.events.length, 0);
  if (!last?.events.length || loaded >= last.total) return undefined;
  return pages.length + 1;
}
