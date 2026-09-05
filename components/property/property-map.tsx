"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

/**
 * OpenStreetMap tabanlı konum haritası.
 *
 * Google Maps yerine Leaflet + OSM tercih edildi: API anahtarı ve
 * faturalandırma kurulumu gerektirmiyor, koyu temaya uyumlu karo (tile)
 * sağlayıcısı kullanılabiliyor.
 *
 * `next/dynamic` ile `ssr: false` olarak yüklenmelidir (Leaflet `window` ister).
 */

/** Marka altınında sade bir konum işareti — varsayılan PNG ikonuna gerek kalmıyor */
const markerIcon = L.divIcon({
  className: "",
  html: `<span style="
    display:block;width:22px;height:22px;border-radius:9999px;
    background:#c9a45c;border:3px solid #08080a;
    box-shadow:0 0 0 6px rgba(201,164,92,.22);
  "></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

/** Koordinat değiştiğinde haritayı yeniden ortalar */
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function PropertyMap({
  lat,
  lng,
  zoom = 15,
  className,
}: {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
}) {
  const center = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className={className}
      style={{ background: "#101013" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıda bulunanlar &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Marker position={center} icon={markerIcon} />
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  );
}
