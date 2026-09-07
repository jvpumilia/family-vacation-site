"use client";

import dynamic from "next/dynamic";
import type { MapDestination, MapLodging } from "./VacationMap";

const VacationMap = dynamic(() => import("./VacationMap").then((m) => m.VacationMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
      Loading map…
    </div>
  ),
});

export function MapLoader(props: { destinations: MapDestination[]; lodgings: MapLodging[] }) {
  return <VacationMap {...props} />;
}
