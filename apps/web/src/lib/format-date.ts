const badgeFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Europe/Paris",
});

export function formatDateBadge(isoDate: string): string {
  const parts = badgeFormatter.formatToParts(new Date(isoDate));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    (parts.find((p) => p.type === type)?.value ?? "").replace(".", "");

  return `${part("weekday")} ${part("day")} ${part("month")}`.toUpperCase();
}
