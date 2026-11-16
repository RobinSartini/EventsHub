import { divIcon } from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

import { Button } from "./button";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  free?: boolean;
};

type EventsMapProps = {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
};

function markerDivIcon(label: string, free: boolean) {
  const cls = free
    ? "bg-card text-foreground border border-border"
    : "bg-primary text-primary-foreground";
  return divIcon({
    html: `<span class="${cls} px-2.5 py-1 rounded-full text-xs font-extrabold whitespace-nowrap shadow-float">${label}</span>`,
    className: "",
    iconAnchor: [0, 0],
  });
}

function EventsMap({
  markers = [],
  center = [44.9334, 4.8924],
  zoom = 13,
  className,
}: Readonly<EventsMapProps>) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={markerDivIcon(m.label, m.free ?? false)}
          />
        ))}
      </MapContainer>

      <div className="absolute top-3 left-1/2 z-[1000] -translate-x-1/2">
        <Button variant="surface" size="sm">
          Rechercher dans cette zone
        </Button>
      </div>
    </div>
  );
}

export { EventsMap };
