const badgeFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Europe/Paris",
});

function dayParts(isoDate: string) {
  const parts = badgeFormatter.formatToParts(new Date(isoDate));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    (parts.find((p) => p.type === type)?.value ?? "").replace(".", "");

  return { weekday: part("weekday"), day: part("day"), month: part("month") };
}

export function formatDateBadge(isoDate: string): string {
  const { weekday, day, month } = dayParts(isoDate);
  return `${weekday} ${day} ${month}`.toUpperCase();
}

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

export function formatTime(isoDate: string): string {
  return timeFormatter.format(new Date(isoDate));
}

export function formatEventDate(isoDate: string): string {
  const { weekday, day, month } = dayParts(isoDate);
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized}. ${day} ${month} - ${formatTime(isoDate)}`;
}

const dayLabelFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export function toIsoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromIsoDay(isoDay: string | undefined): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDay ?? "");
  if (!match) return undefined;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return toIsoDay(date) === isoDay ? date : undefined;
}

export function formatDayLabel(date: Date): string {
  return dayLabelFormatter.format(date);
}
