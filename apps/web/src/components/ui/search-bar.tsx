import { Popover } from "@base-ui/react/popover";
import { SearchIcon } from "lucide-react";
import { type FormEvent, useState } from "react";

import { formatDayLabel, fromIsoDay, toIsoDay } from "@/lib/format-date";
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
  { name: "q", label: "Quoi", type: "search", placeholder: "Concert, expo, atelier..." },
  { name: "city", label: "Où", type: "text", placeholder: "Lyon" },
] as const;

const SEARCH_KEYS: readonly (keyof SearchValues)[] = [...TEXT_FIELDS.map((f) => f.name), "from"];

const field =
  "bg-secondary flex h-12 min-w-0 basis-full items-baseline gap-2.5 rounded-full px-[18px] py-3 md:w-40 md:flex-none";
const fieldLabel = "text-foreground font-mono text-[11px] font-extrabold tracking-widest uppercase";
const fieldText = "min-w-0 flex-1 truncate font-sans text-[15px] leading-6 font-bold";

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
      <Popover.Trigger
        className={cn(
          field,
          "focus-visible:ring-ring cursor-pointer text-left outline-none focus-visible:ring-2 md:w-auto",
        )}
      >
        <span className={fieldLabel}>Quand</span>{" "}
        <span
          className={cn(fieldText, day ? "text-foreground" : "text-muted-foreground font-medium")}
        >
          {day ? formatDayLabel(day) : "Choisir une date"}
        </span>
      </Popover.Trigger>
      <input type="hidden" name="from" value={day ? toIsoDay(day) : ""} />
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={8} className="z-50">
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
        "bg-card border-border flex w-full max-w-[50rem] flex-wrap items-center gap-1 rounded-[32px_32px_32px_10px] border-2 p-1 md:rounded-card",
        className,
      )}
    >
      {TEXT_FIELDS.map((textField) => (
        <label
          key={textField.name}
          className={cn(
            field,
            "has-[input:focus-visible]:ring-ring cursor-text has-[input:focus-visible]:ring-2",
            textField.name === "q" && "md:w-auto md:flex-1",
          )}
        >
          <span className={fieldLabel}>{textField.label}</span>
          <input
            name={textField.name}
            type={textField.type}
            placeholder={textField.placeholder}
            defaultValue={defaultValues?.[textField.name]}
            className={cn(
              fieldText,
              "text-foreground placeholder:text-muted-foreground placeholder:font-medium bg-transparent outline-none focus:placeholder:text-transparent",
            )}
          />
        </label>
      ))}
      <DateField defaultValue={defaultValues?.from} />
      <Button type="submit" className="basis-full md:basis-auto">
        <SearchIcon data-icon="inline-start" />
        Rechercher
      </Button>
    </form>
  );
}

export { SearchBar, type SearchValues };
