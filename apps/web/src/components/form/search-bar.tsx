import { Popover } from "@base-ui/react/popover";
import { SearchIcon, XIcon } from "lucide-react";
import { type FormEvent, Fragment, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";

import { formatDayLabel, formatDaysLabel, fromIsoDay, toIsoDay } from "@/lib/format-date";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { IconButton } from "@/components/ui/icon-button";

type SearchValues = {
  q?: string;
  city?: string;
  from?: string;
  to?: string;
};

type SearchBarProps = {
  defaultValues?: SearchValues;
  onSearch: (values: SearchValues) => void;
  className?: string;
};

const TEXT_FIELDS = [
  {
    name: "q",
    label: "Quoi",
    type: "search",
    placeholder: "Concert, atelier...",
    clearLabel: "Effacer la recherche",
    width: "col-span-4 md:flex-[1.4]",
    separator: "col-span-4 mx-4 mb-1.5 h-px md:mx-0 md:mb-0 md:h-10 md:w-px",
    maxLength: 100,
  },
  {
    name: "city",
    label: "Où",
    type: "text",
    placeholder: "Une ville",
    clearLabel: "Effacer la ville",
    width: "",
    separator: "h-10 w-px",
    maxLength: 100,
  },
] as const;

const SEARCH_KEYS = ["q", "city", "from", "to"] as const;

const field = "group/field flex min-w-0 flex-1 flex-col rounded-full px-4 py-2 md:px-6";
const fieldLabel =
  "text-foreground group-focus-within/field:text-primary group-data-popup-open/field:text-primary text-xs font-extrabold transition-colors";
const fieldText = "w-full truncate text-base leading-5";

function initialRange(from?: string, to?: string): DateRange | undefined {
  const first = fromIsoDay(from);
  return first && { from: first, to: fromIsoDay(to) ?? first };
}

function rangeLabel(range: DateRange | undefined) {
  if (!range?.from) return undefined;
  const { from, to } = range;
  return to && toIsoDay(to) !== toIsoDay(from) ? formatDaysLabel(from, to) : formatDayLabel(from);
}

type DateFieldProps = { defaultFrom?: string; defaultTo?: string };

function DateField({ defaultFrom, defaultTo }: Readonly<DateFieldProps>) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(() => initialRange(defaultFrom, defaultTo));
  const today = new Date();
  const label = rangeLabel(range);
  const from = range?.from && toIsoDay(range.from);
  const to = range?.to && toIsoDay(range.to);

  const choose = (selected: DateRange | undefined) => {
    setRange(selected);
    if (selected?.to) setOpen(false);
  };

  const clear = () => {
    setRange(undefined);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className={cn(focusRing, field, "cursor-pointer text-left")}>
        <span className={fieldLabel}>Quand</span>{" "}
        <span className={cn(fieldText, label ? "text-foreground" : "text-muted-foreground")}>
          {label ?? "Choisir une date"}
        </span>
      </Popover.Trigger>
      <input type="hidden" name="from" value={from ?? ""} />
      <input type="hidden" name="to" value={to && to !== from ? to : ""} />
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="start"
          sideOffset={8}
          collisionAvoidance={{ side: "none", fallbackAxisSide: "none" }}
          className="z-50"
        >
          <Popover.Popup className="bg-card shadow-float ease-signature flex origin-(--transform-origin) flex-col gap-2 rounded-[26px] p-3 transition-[opacity,scale] duration-200 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <Calendar
              mode="range"
              resetOnSelect
              selected={range}
              onSelect={choose}
              defaultMonth={range?.from}
              startMonth={today}
              disabled={{ before: today }}
            />
            {range ? (
              <Button variant="ghost" size="sm" className="self-end" onClick={clear}>
                Effacer la date
              </Button>
            ) : null}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

type TextFieldProps = {
  config: (typeof TEXT_FIELDS)[number];
  defaultValue?: string;
};

function TextField({ config, defaultValue }: Readonly<TextFieldProps>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = () => {
    if (!inputRef.current) return;
    inputRef.current.value = "";
    inputRef.current.focus();
  };

  return (
    <div className={cn("group/text flex min-w-0 flex-1 items-end", config.width)}>
      <label className={cn(field, "cursor-text")}>
        <span className={fieldLabel}>{config.label}</span>
        <input
          ref={inputRef}
          name={config.name}
          type={config.type}
          placeholder={config.placeholder}
          maxLength={config.maxLength}
          defaultValue={defaultValue}
          className={cn(
            fieldText,
            "text-foreground placeholder:text-muted-foreground bg-transparent outline-none focus:placeholder:text-transparent [&::-webkit-search-cancel-button]:hidden",
          )}
        />
      </label>
      <IconButton
        type="button"
        variant="ghost"
        aria-label={config.clearLabel}
        onClick={clear}
        className="text-muted-foreground hover:text-foreground mr-2 mb-1 size-7 shrink-0 group-has-[input:placeholder-shown]/text:hidden"
      >
        <XIcon className="size-3.5" strokeWidth={2.5} />
      </IconButton>
    </div>
  );
}

function SearchBar({ defaultValues, onSearch, className }: Readonly<SearchBarProps>) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values: SearchValues = {};
    for (const key of SEARCH_KEYS) {
      const value = String(data.get(key) ?? "").trim();
      if (value) values[key] = value;
    }
    onSearch(values);
  };

  return (
    <form
      role="search"
      data-slot="search-bar"
      onSubmit={handleSubmit}
      className={cn(
        "bg-card shadow-raised focus-within:shadow-float rounded-card grid w-full max-w-[40rem] grid-cols-[2fr_auto_3fr_auto] items-center border p-1.5 transition-shadow duration-300 md:flex md:rounded-full",
        className,
      )}
    >
      {TEXT_FIELDS.map((config) => (
        <Fragment key={config.name}>
          <TextField config={config} defaultValue={defaultValues?.[config.name]} />
          <span aria-hidden="true" className={cn("bg-border", config.separator)} />
        </Fragment>
      ))}
      <DateField defaultFrom={defaultValues?.from} defaultTo={defaultValues?.to} />
      <Button type="submit" className="mr-0.5 size-12 shrink-0 px-0 md:mr-0">
        <SearchIcon className="size-5" strokeWidth={2.5} />
        <span className="sr-only">Rechercher</span>
      </Button>
    </form>
  );
}

export { SearchBar, type SearchValues };
