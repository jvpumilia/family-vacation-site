"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapDestination = {
  id: string;
  slug: string;
  shortName: string;
  name: string;
  lat: number;
  lng: number;
  totalScore: number;
  status: string;
  lodgingFeasibility: number;
};

export type MapLodging = {
  id: string;
  title: string;
  lat: number | null;
  lng: number | null;
  bedrooms: number;
  qualifies: boolean;
  finalized: boolean;
  destination: { slug: string; shortName: string };
};

const destIcon = new L.DivIcon({
  className: "",
  html: `<div style="background:#0f766e;color:white;border-radius:999px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)">D</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const lodgeIcon = new L.DivIcon({
  className: "",
  html: `<div style="background:#b45309;color:white;border-radius:6px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)">L</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export function VacationMap({
  destinations,
  lodgings,
}: {
  destinations: MapDestination[];
  lodgings: MapLodging[];
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
        Loading map…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200 shadow-sm">
      <MapContainer
        center={[39.5, -98]}
        zoom={4}
        scrollWheelZoom={false}
        className="h-[420px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {destinations.map((d) => (
          <Marker key={d.id} position={[d.lat, d.lng]} icon={destIcon}>
            <Popup>
              <div className="space-y-1 text-sm">
                <strong>{d.shortName}</strong>
                <div>
                  Score {d.totalScore}/100 · {d.status.replace("_", " ")}
                </div>
                {d.lodgingFeasibility < 10 && (
                  <div className="text-red-700">Disqualified — lodging gate</div>
                )}
                <Link className="text-teal-700 underline" href={`/destinations/${d.slug}`}>
                  Open destination
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
        {lodgings
          .filter((l) => l.lat != null && l.lng != null)
          .map((l) => (
            <Marker key={l.id} position={[l.lat!, l.lng!]} icon={lodgeIcon}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <strong>{l.title}</strong>
                  <div>
                    {l.bedrooms} BR · {l.destination.shortName}
                  </div>
                  <div>
                    {l.finalized ? "On ballot" : "Submitted"} ·{" "}
                    {l.qualifies ? "Qualifies" : "Does not qualify"}
                  </div>
                  <Link className="text-teal-700 underline" href={`/lodgings/${l.id}`}>
                    Open lodging
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        {/* origin hints as subtle circles — not labeled with people */}
        {[
          { lat: 47.33, lng: -122.58 }, // Gig Harbor
          { lat: 27.95, lng: -82.46 }, // Tampa-ish FL
          { lat: 36.16, lng: -86.78 }, // Nashville
          { lat: 42.27, lng: -89.09 }, // Rockford
          { lat: 42.68, lng: -89.02 }, // Janesville
        ].map((o, i) => (
          <CircleMarker
            key={i}
            center={[o.lat, o.lng]}
            radius={6}
            pathOptions={{ color: "#92400e", fillColor: "#fbbf24", fillOpacity: 0.6 }}
          />
        ))}
      </MapContainer>
      <div className="flex flex-wrap gap-4 border-t border-amber-100 bg-[#fffaf3] px-4 py-2 text-xs text-amber-900/70">
        <span>Teal = destination</span>
        <span>Amber square = lodging</span>
        <span>Gold dots = family origins (no names)</span>
      </div>
    </div>
  );
}
