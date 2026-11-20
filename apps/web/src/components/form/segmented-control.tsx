import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  label: string;
  showLabel?: boolean;
  options: readonly SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

function SegmentedControl<T extends string>({
  label,
  showLabel = false,
  options,
  value,
  onValueChange,
  className,
}: Readonly<SegmentedControlProps<T>>) {
  return (
    <fieldset data-slot="segmented-control" className={className}>
      <legend className={showLabel ? "mb-3 text-sm font-bold" : "sr-only"}>{label}</legend>
      <div className="bg-secondary inline-flex w-fit rounded-full p-1">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                if (!isSelected) onValueChange(option.value);
              }}
              className={cn(
                focusRing,
                "text-muted-foreground hover:text-foreground h-[38px] cursor-pointer rounded-full px-3.5 font-sans text-sm font-bold whitespace-nowrap transition-colors duration-240 ease-signature",
                "aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:font-extrabold aria-pressed:shadow-sm",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export { SegmentedControl, type SegmentedOption };
