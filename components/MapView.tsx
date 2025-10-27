"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer     = dynamic(() => import("react-leaflet").then(m => m.TileLayer),     { ssr: false });
const Marker        = dynamic(() => import("react-leaflet").then(m => m.Marker),        { ssr: false });
const Popup         = dynamic(() => import("react-leaflet").then(m => m.Popup),         { ssr: false });

type Pin = {
  id?: string;
  title?: string;
  url?: string;
  source?: string;
  lat?: number;
  lng?: number;
  address?: string;
};

export default function MapView({
  pins,
  center = [33.6846, -117.8265],
  zoom = 12,
}: {
  pins: Pin[];
  center?: [number, number];
  zoom?: number;
}) {
  useEffect(() => {
    (async () => {
      const L = await import("leaflet");
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });
    })();
  }, []);

  const withCoords = pins.filter(p => typeof p.lat === "number" && typeof p.lng === "number");

  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow">
      <MapContainer center={center} zoom={zoom} style={{ height: 500, width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((p, i) => (
          <Marker key={p.id || `${p.lat},${p.lng},${i}`} position={[p.lat!, p.lng!]}>
            <Popup>
              <div className="space-y-1">
                <div className="font-medium">{p.title || "Location"}</div>
                {p.address && <div className="text-xs text-slate-600">{p.address}</div>}
                {p.url && (
                  <a
                    className="text-xs text-indigo-600 underline"
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open source page
                  </a>
                )}
                {p.source && <div className="text-[11px] text-slate-500">Source: {p.source}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}