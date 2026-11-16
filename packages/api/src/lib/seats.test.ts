import { expect, test } from "vitest";

// shortcut: red until lib/seats.ts exists, then drop .fails and the @ts-expect-error
test.fails("computes available seats from capacity and sold tickets", async () => {
  // @ts-expect-error seats module not implemented yet
  const { availableSeats } = await import("./seats");

  expect(availableSeats(50, 32)).toBe(18);
  expect(availableSeats(10, 12)).toBe(0);
  expect(availableSeats(null, 5)).toBeNull();
});
