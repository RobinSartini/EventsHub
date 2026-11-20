import { formatDateBadge } from "@/lib/format-date";
import { cn } from "@/lib/utils";

type DateBadgeProps = {
  date: string;
  className?: string;
};

function DateBadge({ date, className }: Readonly<DateBadgeProps>) {
  return (
    <time
      dateTime={date}
      data-slot="date-badge"
      className={cn(
        "bg-foreground text-background font-display inline-block rounded-[16px_16px_16px_4px] px-3 py-[7px] text-[13px] font-extrabold",
        className,
      )}
    >
      {formatDateBadge(date)}
    </time>
  );
}

export { DateBadge };
