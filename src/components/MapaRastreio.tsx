import { useEffect, useRef } from "react";
import L from "leaflet";

export type PontoMapa = { latitude: number; longitude: number; registrada_em: string };
export type PontoFixo = { lat: number; lng: number; rotulo: string; sub: string };

const AZUL = "#4f7cff";
const OURO = "#f0b429";

function pin(cor: string, icone: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;background:${cor};box-shadow:0 0 0 5px ${cor}33,0 4px 10px rgba(0,0,0,.5);color:#fff;font-size:12px;font-weight:700">${icone}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export default function MapaRastreio({
  ponto,
  origem,
  destino,
}: {
  ponto: PontoMapa | null;
  origem?: PontoFixo | null;
  destino?: PontoFixo | null;
}) {
  const container = useRef<HTMLDivElement | null>(null);
  const mapa = useRef<L.Map | null>(null);
  const marcador = useRef<L.Marker | null>(null);
  const rastro = useRef<L.Polyline | null>(null);
  const planejado = useRef<L.Polyline | null>(null);
  const fixos = useRef<L.Marker[]>([]);
  const seguiu = useRef(false);

  useEffect(() => {
    if (!container.current || mapa.current) return;
    const m = L.map(container.current, { zoomControl: false, attributionControl: false }).setView(
      [-12.9777, -38.5016],
      12,
    );
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap © CARTO",
      subdomains: 'abcd'
    }).addTo(m);


    L.control.zoom({ position: "bottomright" }).addTo(m);

    planejado.current = L.polyline([], {
      color: OURO,
      weight: 4,
      opacity: 0.75,
      dashArray: "8 10",
    }).addTo(m);
    rastro.current = L.polyline([], { color: AZUL, weight: 5, opacity: 0.9 }).addTo(m);
    mapa.current = m;

    return () => {
      m.remove();
      mapa.current = null;
      marcador.current = null;
      rastro.current = null;
      planejado.current = null;
      fixos.current = [];
      seguiu.current = false;
    };
  }, []);

  // origem e destino permanecem fixos no mapa
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    fixos.current.forEach((f) => f.remove());
    fixos.current = [];
    const pontos: L.LatLngExpression[] = [];

    if (origem) {
      pontos.push([origem.lat, origem.lng]);
      fixos.current.push(
        L.marker([origem.lat, origem.lng], { icon: pin(AZUL, "A") })
          .addTo(m)
          .bindTooltip(`${origem.rotulo}<br>${origem.sub}`, { direction: "top", offset: [0, -14] }),
      );
    }
    if (destino) {
      pontos.push([destino.lat, destino.lng]);
      fixos.current.push(
        L.marker([destino.lat, destino.lng], { icon: pin(OURO, "B") })
          .addTo(m)
          .bindTooltip(`${destino.rotulo}<br>${destino.sub}`, {
            direction: "top",
            offset: [0, -14],
          }),
      );
    }
    planejado.current?.setLatLngs(pontos.length === 2 ? pontos : []);
    if (pontos.length > 0 && !seguiu.current) {
      m.fitBounds(L.latLngBounds(pontos).pad(0.35), { animate: false });
    }
  }, [origem, destino]);

  // marcador real do veículo
  useEffect(() => {
    const m = mapa.current;
    if (!m || !ponto) return;
    const pos: L.LatLngExpression = [ponto.latitude, ponto.longitude];
    if (!marcador.current) {
      marcador.current = L.marker(pos, { icon: pin(AZUL, "▲"), zIndexOffset: 500 }).addTo(m);
    } else {
      marcador.current.setLatLng(pos);
    }
    rastro.current?.addLatLng(pos);
    seguiu.current = true;
    m.setView(pos, Math.max(m.getZoom(), 14), { animate: true });
  }, [ponto]);

  return <div ref={container} className="h-full w-full" aria-label="Mapa da viagem em tempo real" />;
}
