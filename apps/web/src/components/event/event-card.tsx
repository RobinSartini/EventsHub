import { Link } from "react-router";

import { formatEventDate } from "@/lib/format-date";
import { formatDistance } from "@/lib/format-distance";
import { formatPrice } from "@/lib/format-price";
import { cn } from "@/lib/utils";

import { FavoriteButton } from "./favorite-button";

type EventCardEvent = {
  id: string;
  name: string;
  startDate: string;
  location?: string;
  status?: "published" | "cancelled";
  priceCents?: number;
  distanceKm?: number;
};

type EventCardProps = {
  event: EventCardEvent;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  className?: string;
};

const MEDIA_THEMES = [
  { media: "bg-primary", first: "bg-signal", second: "bg-sky" },
  { media: "bg-sky", first: "bg-primary", second: "bg-signal" },
  { media: "bg-signal", first: "bg-primary-soft", second: "bg-primary" },
  { media: "bg-primary-soft", first: "bg-primary", second: "bg-signal-soft" },
  { media: "bg-signal-soft", first: "bg-signal", second: "bg-primary" },
];

const MEDIA_LAYOUTS = [
  { first: "-top-[20%] -right-[25%] size-[85%]", second: "-bottom-[30%] -left-[20%] size-[70%]" },
  { first: "-top-[30%] -left-[20%] size-[80%]", second: "-right-[25%] -bottom-[25%] size-[65%]" },
  { first: "-right-[30%] -bottom-[35%] size-[95%]", second: "-top-[15%] -left-[15%] size-[45%]" },
  { first: "top-[20%] -left-[35%] size-[80%]", second: "-top-[25%] -right-[15%] size-[55%]" },
];

function mediaLook(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  return {
    theme: MEDIA_THEMES[hash % MEDIA_THEMES.length],
    layout: MEDIA_LAYOUTS[(hash >>> 8) % MEDIA_LAYOUTS.length],
  };
}

const blob =
  "ease-signature absolute rounded-[42%_58%_63%_37%/41%_44%_56%_59%] transition-[border-radius,scale] duration-700 group-hover/card:scale-105 group-hover/card:rounded-[63%_37%_38%_62%/55%_61%_39%_45%] group-has-[a:focus-visible]/card:scale-105";
const meta = "text-muted-foreground text-sm";

function Price({ priceCents }: Readonly<{ priceCents: number }>) {
  return (
    <p className="text-sm">
      <span className="font-mono font-bold">{formatPrice(priceCents / 100)}</span>
      {priceCents > 0 ? <span className="text-muted-foreground"> par personne</span> : null}
    </p>
  );
}

function EventCard({ event, isFavorite, onToggleFavorite, className }: Readonly<EventCardProps>) {
  const { theme, layout } = mediaLook(event.id);
  const distance = event.distanceKm === undefined ? undefined : formatDistance(event.distanceKm);
  const place = [event.location, distance].filter(Boolean).join(" - ");

  return (
    <article
      data-slot="event-card"
      className={cn(
        "has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-background group/card relative flex flex-col gap-3 rounded-card has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-offset-4",
        className,
      )}
    >
      <div className={cn("clip-media relative aspect-[20/19]", theme.media)}>
        <div aria-hidden="true" className={cn(blob, theme.first, layout.first)} />
        <div aria-hidden="true" className={cn(blob, theme.second, layout.second)} />
        {event.status === "cancelled" ? (
          <span className="bg-card text-signal-text absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-extrabold">
            Annulé
          </span>
        ) : null}
        {onToggleFavorite ? (
          <FavoriteButton
            isFavorite={isFavorite ?? false}
            eventName={event.name}
            onToggle={onToggleFavorite}
            className="absolute top-3 right-3 z-10"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base leading-snug font-bold group-hover/card:underline">
          <Link
            to={`/events/${encodeURIComponent(event.id)}`}
            className="outline-none after:absolute after:inset-0 after:rounded-card"
          >
            {event.name}
          </Link>
        </h3>
        {place ? <p className={meta}>{place}</p> : null}
        <p className={meta}>{formatEventDate(event.startDate)}</p>
        {event.priceCents === undefined ? null : <Price priceCents={event.priceCents} />}
      </div>
    </article>
  );
}

export { EventCard, type EventCardEvent };
