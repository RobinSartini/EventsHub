import { useEffect, useState } from "react";

import type { Position } from "./home-search";

const round = (degrees: number) => Math.round(degrees * 1000) / 1000;
const OPTIONS: PositionOptions = { timeout: 10_000, maximumAge: 10 * 60_000 };

export function usePosition(enabled: boolean) {
  const [position, setPosition] = useState<Position>();
  const [refused, setRefused] = useState(false);
  const denied = refused || !("geolocation" in navigator);

  useEffect(() => {
    if (!enabled || position || denied) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setPosition({ lat: round(coords.latitude), lng: round(coords.longitude) }),
      () => setRefused(true),
      OPTIONS,
    );
  }, [enabled, position, denied]);

  return { position, denied, pending: enabled && !position && !denied };
}
