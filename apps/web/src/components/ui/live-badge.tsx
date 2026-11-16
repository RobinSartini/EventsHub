import { cn } from "@/lib/utils";

type LiveBadgeProps = {
  detail?: string;
  className?: string;
};

function LiveBadge({ detail, className }: Readonly<LiveBadgeProps>) {
  return (
    <span
      data-slot="live-badge"
      className={cn(
        "bg-live text-live-foreground inline-flex items-center gap-2 rounded-full px-3.5 py-2 font-mono text-xs font-bold uppercase",
        className,
      )}
    >
      <span aria-hidden="true" className="relative size-2 shrink-0">
        <span className="bg-live-foreground absolute inset-0 rounded-full" />
        <span className="border-live-foreground absolute inset-0 animate-ping rounded-full border-2 motion-reduce:animate-none" />
      </span>
      {detail ? `En direct - ${detail}` : "En direct"}
    </span>
  );
}

export { LiveBadge };
