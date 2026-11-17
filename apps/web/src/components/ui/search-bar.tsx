import { Popover } from "@base-ui/react/popover";
import { SearchIcon } from "lucide-react";
import { type FormEvent, Fragment, useState } from "react";

import { formatDayLabel, fromIsoDay, toIsoDay } from "@/lib/format-date";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Calendar } from "./calendar";

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
    width: "md:flex-[1.4]",
  },
  { name: "city", label: "Où", type: "text", placeholder: "Une ville", width: "" },
] as const;

const SEARCH_KEYS: readonly (keyof SearchValues)[] = [...TEXT_FIELDS.map((f) => f.name), "from"];

const field = "flex min-w-0 flex-1 flex-col gap-1 rounded-full px-6 py-3 md:px-8";
const fieldLabel = "text-foreground text-sm font-extrabold";
const fieldText = "w-full truncate text-base leading-6";

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
          <Popover.Popup className="bg-card shadow-float flex flex-col gap-2 rounded-[26px] p-3 outline-none">
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
        "bg-card shadow-float flex w-full max-w-3xl flex-col gap-2 rounded-3xl border p-2 md:flex-row md:items-center md:rounded-full md:p-1.5",
        className,
      )}
    >
      <div className="flex flex-1 flex-col md:flex-row md:items-center">
        {TEXT_FIELDS.map((textField) => (
          <Fragment key={textField.name}>
            <label className={cn(field, "cursor-text", textField.width)}>
              <span className={fieldLabel}>{textField.label}</span>
              <input
                name={textField.name}
                type={textField.type}
                placeholder={textField.placeholder}
                defaultValue={defaultValues?.[textField.name]}
                className={cn(
                  fieldText,
                  "text-foreground placeholder:text-muted-foreground bg-transparent outline-none focus:placeholder:text-transparent",
                )}
              />
            </label>
            <span aria-hidden="true" className="bg-border mx-6 h-px md:mx-0 md:h-12 md:w-px" />
          </Fragment>
        ))}
        <DateField defaultValue={defaultValues?.from} />
      </div>
      <Button type="submit" className="md:size-16 md:shrink-0 md:px-0">
        <SearchIcon className="md:size-6" strokeWidth={2.5} />
        <span className="md:sr-only">Rechercher</span>
      </Button>
    </form>
  );
}

export { SearchBar, type SearchValues };
