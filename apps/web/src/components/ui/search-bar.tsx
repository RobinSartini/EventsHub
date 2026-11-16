import type { FormEvent } from "react";

import { cn } from "@/lib/utils";

// Composant réservé : API définitive, rendu final dans la PR 3 (#33).

/** Mêmes noms que les filtres de GET /events dans le contrat d'API. */
type SearchValues = {
  q?: string;
  city?: string;
  from?: string;
};

type SearchBarProps = {
  defaultValues?: SearchValues;
  /** Reçoit seulement les champs remplis. */
  onSearch: (values: SearchValues) => void;
  className?: string;
};

function SearchBar({ defaultValues, onSearch, className }: Readonly<SearchBarProps>) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values: SearchValues = {};
    for (const key of ["q", "city", "from"] as const) {
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
      className={cn("bg-card flex flex-wrap items-end gap-2 rounded-full p-2", className)}
    >
      <label className="flex flex-col text-xs font-bold">
        Quoi
        <input name="q" type="search" defaultValue={defaultValues?.q} />
      </label>
      <label className="flex flex-col text-xs font-bold">
        Où
        <input name="city" defaultValue={defaultValues?.city} />
      </label>
      <label className="flex flex-col text-xs font-bold">
        Quand
        <input name="from" type="date" defaultValue={defaultValues?.from} />
      </label>
      <button type="submit" className="bg-primary text-primary-foreground rounded-full px-4 py-2">
        Rechercher
      </button>
    </form>
  );
}

export { SearchBar, type SearchValues };
