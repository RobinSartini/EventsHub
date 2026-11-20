import { fromIsoDay } from "./format-date";

export const TONIGHT = "ce-soir";
export const PAGE_SIZE = 12;
const TONIGHT_HOUR = 18;
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

function toSearchParams(fields: Record<string, string | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value) params.set(key, value);
  }
  return params;
}

export function writeHomeSearch(fields: HomeFilters): URLSearchParams {
  return toSearchParams(fields);
}

function tonightRange(now: Date) {
  const start = new Date(now);
  start.setHours(Math.max(now.getHours(), TONIGHT_HOUR), 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function eventsQuery({ category, from, ...search }: HomeFilters, now: Date, page: number) {
  const tonight = category === TONIGHT ? tonightRange(now) : undefined;
  return toSearchParams({
    ...search,
    from: tonight?.from ?? fromIsoDay(from)?.toISOString(),
    to: tonight?.to,
    category: tonight ? undefined : category,
    page: String(page),
    pageSize: String(PAGE_SIZE),
  }).toString();
}

type LoadedPage = { events: readonly unknown[]; total: number };

export function nextPage(pages: readonly LoadedPage[]): number | undefined {
  const last = pages.at(-1);
  const loaded = pages.reduce((count, page) => count + page.events.length, 0);
  if (!last?.events.length || loaded >= last.total) return undefined;
  return pages.length + 1;
}
