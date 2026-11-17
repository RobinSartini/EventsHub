import { plural } from "./plural";

const HOT_RATIO = 0.75;

type CapacityStatus = {
  level: "calm" | "hot" | "full";
  hint: string;
};

const places = (count: number) => `${count} ${plural(count, "place")}`;

export function capacityStatus(taken: number, capacity: number): CapacityStatus {
  const remaining = capacity - taken;
  if (remaining <= 0) return { level: "full", hint: "Complet" };
  if (taken / capacity >= HOT_RATIO) return { level: "hot", hint: `Plus que ${places(remaining)}` };
  return {
    level: "calm",
    hint: `${places(remaining)} ${plural(remaining, "disponible")}`,
  };
}
