const euro = (fractionDigits: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  });

const wholeEuro = euro(0);
const centEuro = euro(2);

export function formatPrice(price: number | null): string {
  if (!price) return "Gratuit";
  return (Number.isInteger(price) ? wholeEuro : centEuro).format(price);
}
