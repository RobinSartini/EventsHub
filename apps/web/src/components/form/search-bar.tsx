import { Popover } from "@base-ui/react/popover";
import { SearchIcon } from "lucide-react";
import { type FormEvent, Fragment, useState } from "react";

import { formatDayLabel, fromIsoDay, toIsoDay } from "@/lib/format-date";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

type SearchValues = {
  q?: string;
  city?: string;
  from?: string;
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
    width: "col-span-4 md:flex-[1.4]",
    separator: "col-span-4 mx-4 mb-1.5 h-px md:mx-0 md:mb-0 md:h-10 md:w-px",
    maxLength: 100,
  },
  {
    name: "city",
    label: "Où",
    type: "text",
    placeholder: "Une ville",
    width: "",
    separator: "h-10 w-px",
    maxLength: 100,
  },
] as const;

const SEARCH_KEYS = ["q", "city", "from"] as const;

const field = "group/field flex min-w-0 flex-1 flex-col rounded-full px-4 py-2 md:px-6";
const fieldLabel =
  "text-foreground group-focus-within/field:text-primary group-data-popup-open/field:text-primary text-xs font-extrabold transition-colors";
const fieldText = "w-full truncate text-base leading-5";

function DateField({ defaultValue }: Readonly<{ defaultValue?: string }>) {
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState(() => fromIsoDay(defaultValue));
  const today = new Date();

  const choose = (selected: Date | undefined) => {
    setDay(selected);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className={cn(focusRing, field, "cursor-pointer text-left")}>
        <span className={fieldLabel}>Quand</span>{" "}
        <span className={cn(fieldText, day ? "text-foreground" : "text-muted-foreground")}>
          {day ? formatDayLabel(day) : "Choisir une date"}
        </span>
      </Popover.Trigger>
      <input type="hidden" name="from" value={day ? toIsoDay(day) : ""} />
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
              mode="single"
              selected={day}
              onSelect={choose}
              defaultMonth={day}
              startMonth={today}
              disabled={{ before: today }}
            />
            {day ? (
              <Button
                variant="ghost"
                size="sm"
                className="self-end"
                onClick={() => choose(undefined)}
              >
                Effacer la date
              </Button>
            ) : null}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
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
      {TEXT_FIELDS.map((textField) => (
        <Fragment key={textField.name}>
          <label className={cn(field, "cursor-text", textField.width)}>
            <span className={fieldLabel}>{textField.label}</span>
            <input
              name={textField.name}
              type={textField.type}
              placeholder={textField.placeholder}
              maxLength={textField.maxLength}
              defaultValue={defaultValues?.[textField.name]}
              className={cn(
                fieldText,
                "text-foreground placeholder:text-muted-foreground bg-transparent outline-none focus:placeholder:text-transparent",
              )}
            />
          </label>
          <span aria-hidden="true" className={cn("bg-border", textField.separator)} />
        </Fragment>
      ))}
      <DateField defaultValue={defaultValues?.from} />
      <Button type="submit" className="mr-0.5 size-12 shrink-0 px-0 md:mr-0">
        <SearchIcon className="size-5" strokeWidth={2.5} />
        <span className="sr-only">Rechercher</span>
      </Button>
    </form>
  );
}

export { SearchBar, type SearchValues };
