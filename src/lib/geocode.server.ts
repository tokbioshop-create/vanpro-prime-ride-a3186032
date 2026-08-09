/** Geocodificação real (Nominatim/OpenStreetMap) para fixar origem e destino da viagem. */
export type Coord = { lat: number; lng: number } | null;

export async function geocodificar(endereco: string): Promise<Coord> {
  const texto = endereco.trim();
  if (!texto) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(texto)}`;
    const r = await fetch(url, {
      headers: { "User-Agent": "VanPro/1.0 (rastreamento)", Accept: "application/json" },
    });
    if (!r.ok) return null;
    const json = (await r.json()) as Array<{ lat: string; lon: string }>;
    const primeiro = json[0];
    if (!primeiro) return null;
    const lat = Number(primeiro.lat);
    const lng = Number(primeiro.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}
