import { fromIsoDay } from "./format-date";

export const TONIGHT = "ce-soir";
export const PAGE_SIZE = 12;
const TONIGHT_HOUR = 18;
const MAX_LENGTH = 100;

export type HomeFilters = {
  q?: string;
  city?: string;
  from?: string;
  to?: string;
  category?: string;
  sort?: Sort;
};

export type Sort = "date" | "distance";

export type Position = { lat: number; lng: number };

function text(value: string | null): string | undefined {
  return value?.trim().slice(0, MAX_LENGTH) || undefined;
}

function isoDay(value: string | null): string | undefined {
  return value && fromIsoDay(value) ? value : undefined;
}

export function readHomeSearch(params: URLSearchParams): HomeFilters {
  const from = isoDay(params.get("from"));
  const to = isoDay(params.get("to"));

  return {
    q: text(params.get("q")),
    city: text(params.get("city")),
    from,
    to: from && to && to > from ? to : undefined,
    category: text(params.get("category")),
    sort: params.get("sort") === "distance" ? "distance" : undefined,
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

function endOfDay(day: Date) {
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  return end;
}

function tonightRange(now: Date) {
  const start = new Date(now);
  start.setHours(Math.max(now.getHours(), TONIGHT_HOUR), 0, 0, 0);
  return { from: start.toISOString(), to: endOfDay(now).toISOString() };
}

function daysRange(from: string | undefined, to: string | undefined) {
  const first = fromIsoDay(from);
  const last = fromIsoDay(to) ?? first;
  return { from: first?.toISOString(), to: last && endOfDay(last).toISOString() };
}

export function eventsQuery(
  { category, from, to, sort, ...search }: HomeFilters,
  now: Date,
  page: number,
  position?: Position,
) {
  const tonight = category === TONIGHT ? tonightRange(now) : undefined;
  const days = tonight ?? daysRange(from, to);
  const near = sort === "distance" ? position : undefined;
  return toSearchParams({
    ...search,
    from: days.from,
    to: days.to,
    category: tonight ? undefined : category,
    sort: near && sort,
    lat: near && String(near.lat),
    lng: near && String(near.lng),
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
