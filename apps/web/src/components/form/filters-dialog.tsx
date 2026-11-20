import { Dialog } from "@base-ui/react/dialog";
import { createLucideIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import type { Sort } from "@/lib/home-search";

import { SegmentedControl } from "./segmented-control";

type FiltersDialogProps = {
  sort: Sort;
  onApply: (sort: Sort) => void;
};

const FiltersIcon = createLucideIcon("Filters", [
  ["path", { d: "M4 6h9M17 6h3M4 12h3M11 12h9M4 18h10M18 18h2", key: "lines" }],
  ["circle", { cx: "15", cy: "6", r: "2", key: "top" }],
  ["circle", { cx: "9", cy: "12", r: "2", key: "middle" }],
  ["circle", { cx: "16", cy: "18", r: "2", key: "bottom" }],
]);

const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "distance", label: "Distance" },
] as const;

function FiltersDialog({ sort, onApply }: Readonly<FiltersDialogProps>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(sort);
  const active = sort === "distance" ? 1 : 0;

  const changeOpen = (next: boolean) => {
    if (next) setDraft(sort);
    setOpen(next);
  };

  const apply = () => {
    onApply(draft);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger
        render={
          <Button
            variant="outline"
            className="border hover:bg-transparent aria-expanded:bg-transparent"
          />
        }
      >
        <FiltersIcon />
        Filtres
        {active ? (
          <span className="bg-primary text-primary-foreground grid size-5 place-items-center rounded-full text-xs">
            {active}
            <span className="sr-only"> actif</span>
          </span>
        ) : null}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="bg-card shadow-float ease-signature fixed inset-x-0 bottom-0 z-50 flex flex-col gap-6 rounded-t-[26px] p-6 transition-[opacity,translate] duration-300 outline-none data-ending-style:translate-y-8 data-ending-style:opacity-0 data-starting-style:translate-y-8 data-starting-style:opacity-0 md:inset-x-auto md:top-1/2 md:left-1/2 md:bottom-auto md:w-[28rem] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[26px]">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-display text-xl font-extrabold">Filtres</Dialog.Title>
            <Dialog.Close render={<IconButton aria-label="Fermer" />}>
              <XIcon />
            </Dialog.Close>
          </div>

          <div className="flex flex-col gap-3">
            <p aria-hidden="true" className="text-sm font-bold">
              Trier par
            </p>
            <SegmentedControl
              label="Trier par"
              options={SORT_OPTIONS}
              value={draft}
              onValueChange={setDraft}
            />
            {draft === "distance" ? (
              <p className="text-muted-foreground text-sm">
                Ta position sert seulement à calculer les distances.
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="link" size="sm" onClick={() => setDraft("date")}>
              Réinitialiser
            </Button>
            <Button onClick={apply}>Afficher les résultats</Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { FiltersDialog };
