import { DayPicker, type DayPickerProps } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

const navButton = cn(
  focusRing,
  "hover:bg-muted inline-flex size-9 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-40",
);

function CalendarChevron({ orientation }: Readonly<{ orientation?: string }>) {
  const Icon = orientation === "left" ? ChevronLeftIcon : ChevronRightIcon;
  return <Icon aria-hidden="true" className="size-4" strokeWidth={2.5} />;
}

function Calendar({ className, ...props }: DayPickerProps) {
  return (
    <DayPicker
      locale={fr}
      showOutsideDays
      className={cn("relative w-fit font-sans", className)}
      classNames={{
        months: "flex flex-col",
        month: "flex flex-col gap-3",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: navButton,
        button_next: navButton,
        month_caption: "flex h-9 items-center justify-center",
        caption_label: "font-display text-sm font-semibold capitalize",
        weekdays: "flex",
        weekday: "text-muted-foreground w-10 font-mono text-[11px] font-bold uppercase",
        week: "mt-1 flex",
        day: "size-10 p-0 text-center text-sm",
        day_button: cn(
          focusRing,
          "hover:bg-muted size-10 cursor-pointer rounded-full font-bold disabled:cursor-not-allowed",
        ),
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
        range_start: "bg-primary/15 rounded-l-full",
        range_end: "bg-primary/15 rounded-r-full",
        range_middle:
          "bg-primary/15 [&>button]:bg-transparent! [&>button]:text-foreground! [&>button]:hover:bg-muted!",
        today: "[&>button]:text-signal-text [&>button]:font-extrabold",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-40",
      }}
      components={{ Chevron: CalendarChevron }}
      {...props}
    />
  );
}

export { Calendar };
