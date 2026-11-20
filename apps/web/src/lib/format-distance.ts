const kilometers = (fractionDigits: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "unit",
    unit: "kilometer",
    maximumFractionDigits: fractionDigits,
  });

const nearby = kilometers(1);
const far = kilometers(0);

export function formatDistance(km: number): string {
  return (km < 10 ? nearby : far).format(km);
}
