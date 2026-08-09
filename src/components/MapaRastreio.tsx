import { useEffect, useRef } from "react";
import L from "leaflet";

export type PontoMapa = { latitude: number; longitude: number; registrada_em: string };

export default function MapaRastreio({ ponto }: { ponto: PontoMapa | null }) {
  const container = useRef<HTMLDivElement | null>(null);
  const mapa = useRef<L.Map | null>(null);
  const marcador = useRef<L.CircleMarker | null>(null);
  const rastro = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!container.current || mapa.current) return;
    const m = L.map(container.current, { zoomControl: true, attributionControl: true }).setView(
      [-12.9777, -38.5016],
      13,
    );
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(m);
    rastro.current = L.polyline([], { color: "#1a2cf0", weight: 4, opacity: 0.7 }).addTo(m);
    mapa.current = m;

    return () => {
      m.remove();
      mapa.current = null;
      marcador.current = null;
      rastro.current = null;
    };
  }, []);

  useEffect(() => {
    const m = mapa.current;
    if (!m || !ponto) return;
    const pos: L.LatLngExpression = [ponto.latitude, ponto.longitude];
    if (!marcador.current) {
      marcador.current = L.circleMarker(pos, {
        radius: 9,
        color: "#ffffff",
        weight: 3,
        fillColor: "#1a2cf0",
        fillOpacity: 1,
      }).addTo(m);
    } else {
      marcador.current.setLatLng(pos);
    }
    rastro.current?.addLatLng(pos);
    m.setView(pos, Math.max(m.getZoom(), 15), { animate: true });
  }, [ponto]);

  return <div ref={container} className="h-full w-full" aria-label="Mapa da viagem em tempo real" />;
}
