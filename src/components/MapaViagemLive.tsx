import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { comoRastreio, type PosicaoRow } from "@/lib/rastreio-db";
import type { PontoFixo } from "./MapaRastreio";

const MapaRastreio = lazy(() => import("./MapaRastreio"));

/** Mapa sempre visível: origem e destino fixos + posição real do veículo quando houver GPS. */
export function MapaViagemLive({
  viagemId,
  origem,
  destino,
  ativo = true,
  className = "h-full w-full",
}: {
  viagemId?: string | null;
  origem?: PontoFixo | null;
  destino?: PontoFixo | null;
  ativo?: boolean;
  className?: string;
}) {
  const [ponto, setPonto] = useState<PosicaoRow | null>(null);

  useEffect(() => {
    if (!viagemId || !ativo) {
      setPonto(null);
      return;
    }
    let vivo = true;
    const db = comoRastreio(supabase);
    async function ultima() {
      const { data } = await db
        .from("posicoes_viagem")
        .select("*")
        .eq("viagem_id", viagemId!)
        .order("registrada_em", { ascending: false })
        .limit(1);
      if (vivo && data && data[0]) setPonto(data[0]);
    }
    void ultima();

    const canal = supabase
      .channel(`mapa-${viagemId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posicoes_viagem",
          filter: `viagem_id=eq.${viagemId}`,
        },
        (payload) => setPonto(payload.new as PosicaoRow),
      )
      .subscribe();

    const timer = window.setInterval(() => void ultima(), 15000);
    return () => {
      vivo = false;
      window.clearInterval(timer);
      void supabase.removeChannel(canal);
    };
  }, [viagemId, ativo]);

  return (
    <div className={className}>
      <ClientOnly fallback={<div className="bg-track-surface-2 h-full w-full" />}>
        <Suspense fallback={<div className="bg-track-surface-2 h-full w-full" />}>
          <MapaRastreio ponto={ponto} origem={origem ?? null} destino={destino ?? null} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}

export default MapaViagemLive;
