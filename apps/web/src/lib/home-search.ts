import { fromIsoDay, toIsoDay } from "./format-date";

// Pseudo-catégorie de l'accueil : les événements du jour, via from/to du contrat.
export const TONIGHT = "ce-soir";
export const PAGE_SIZE = 12;
const MAX_LENGTH = 100;

export type HomeSearch = {
  q?: string;
  city?: string;
  from?: string;
  category?: string;
  page: number;
};

function text(value: string | null): string | undefined {
  return value?.trim().slice(0, MAX_LENGTH) || undefined;
}

export function readHomeSearch(params: URLSearchParams): HomeSearch {
  const from = params.get("from") ?? undefined;
  const page = Number(params.get("page"));

  return {
    q: text(params.get("q")),
    city: text(params.get("city")),
    from: fromIsoDay(from) ? from : undefined,
    category: text(params.get("category")),
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

export function writeHomeSearch({ page = 1, ...fields }: Partial<HomeSearch>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  return params;
}

export function eventsQuery({ category, from, ...search }: HomeSearch, today: Date): string {
  const tonight = category === TONIGHT ? toIsoDay(today) : undefined;
  const params = writeHomeSearch({
    q: search.q,
    city: search.city,
    from: tonight ?? from,
    category: tonight ? undefined : category,
  });

  if (tonight) params.set("to", tonight);
  params.set("page", String(search.page));
  params.set("pageSize", String(PAGE_SIZE));
  return params.toString();
}
