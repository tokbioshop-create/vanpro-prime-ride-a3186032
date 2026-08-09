import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { MapPin, Radio, WifiOff } from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { supabase } from "@/integrations/supabase/client";
import { comoRastreio, type PosicaoRow, type ViagemRow } from "@/lib/rastreio-db";

const MapaRastreio = lazy(() => import("@/components/MapaRastreio"));

export const Route = createFileRoute("/acompanhar")({
  head: () => ({
    meta: [
      { title: "Acompanhar viagem — VanPro" },
      {
        name: "description",
        content:
          "Acompanhe em tempo real a localização GPS real do veículo durante a viagem no VanPro.",
      },
      { property: "og:title", content: "Acompanhar viagem — VanPro" },
      {
        property: "og:description",
        content: "Localização real do veículo atualizada automaticamente enquanto a viagem está ativa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Acompanhar,
});

const db = () => comoRastreio(supabase);

function Acompanhar() {
  const [viagens, setViagens] = useState<ViagemRow[]>([]);
  const [viagemId, setViagemId] = useState<string | null>(null);
  const [posicao, setPosicao] = useState<PosicaoRow | null>(null);
  const [online, setOnline] = useState(true);
  const [carregando, setCarregando] = useState(true);

  // viagens com compartilhamento ativo (RLS já filtra) + atualização em tempo real da lista
  useEffect(() => {
    let vivo = true;
    async function carregar() {
      const { data } = await db()
        .from("viagens_rastreadas")
        .select("*")
        .order("atualizada_em", { ascending: false });
      if (!vivo) return;
      setViagens(data ?? []);
      setCarregando(false);
      setViagemId((atual) => atual ?? data?.[0]?.id ?? null);
    }
    void carregar();

    const canal = supabase
      .channel("viagens-ativas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "viagens_rastreadas" },
        () => void carregar(),
      )
      .subscribe();

    return () => {
      vivo = false;
      void supabase.removeChannel(canal);
    };
  }, []);

  // posição real da viagem selecionada
  useEffect(() => {
    if (!viagemId) {
      setPosicao(null);
      return;
    }
    let vivo = true;
    async function ultima() {
      const { data } = await db()
        .from("posicoes_viagem")
        .select("*")
        .eq("viagem_id", viagemId!)
        .order("registrada_em", { ascending: false })
        .limit(1);
      if (vivo && data && data[0]) setPosicao(data[0]);
    }
    void ultima();

    const canal = supabase
      .channel(`posicoes-${viagemId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posicoes_viagem",
          filter: `viagem_id=eq.${viagemId}`,
        },
        (payload) => setPosicao(payload.new as PosicaoRow),
      )
      .subscribe();

    // rede instável: revalida a última posição periodicamente, sem quebrar o acompanhamento
    const timer = window.setInterval(() => void ultima(), 15000);

    return () => {
      vivo = false;
      window.clearInterval(timer);
      void supabase.removeChannel(canal);
    };
  }, [viagemId]);

  useEffect(() => {
    const atualizar = () => setOnline(navigator.onLine);
    atualizar();
    window.addEventListener("online", atualizar);
    window.addEventListener("offline", atualizar);
    return () => {
      window.removeEventListener("online", atualizar);
      window.removeEventListener("offline", atualizar);
    };
  }, []);

  const viagem = useMemo(() => viagens.find((v) => v.id === viagemId) ?? null, [viagens, viagemId]);

  return (
    <AppScreen title="Acompanhar viagem" subtitle="Localização real em tempo real">
      {!online && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-[11px] text-muted-foreground">
          <WifiOff className="size-4" /> Sem internet. O acompanhamento volta sozinho ao reconectar.
        </div>
      )}

      {carregando ? (
        <p className="text-xs text-muted-foreground">Carregando viagens…</p>
      ) : viagens.length === 0 ? (
        <div className="card-elevated p-5 text-center">
          <MapPin className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 text-sm font-bold">Nenhuma viagem sendo compartilhada</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            O acompanhamento aparece aqui quando a empresa ativa o compartilhamento da viagem.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {viagens.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setViagemId(v.id)}
                className={`press shrink-0 rounded-full px-3.5 py-2 text-[11px] font-bold ${
                  v.id === viagemId
                    ? "bg-brand text-primary-foreground"
                    : "bg-surface-2 text-muted-foreground"
                }`}
              >
                {v.titulo}
              </button>
            ))}
          </div>

          <div className="card-elevated overflow-hidden">
            <div className="h-[58vh] w-full">
              <ClientOnly fallback={<div className="h-full w-full bg-surface-2" />}>
                <Suspense fallback={<div className="h-full w-full bg-surface-2" />}>
                  <MapaRastreio ponto={posicao} />
                </Suspense>
              </ClientOnly>
            </div>
            <div className="flex items-center gap-2 px-4 py-3">
              <Radio
                className={`size-4 ${posicao ? "animate-pulse text-success" : "text-muted-foreground"}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">
                  {viagem?.origem || "—"} → {viagem?.destino || "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {posicao
                    ? `Atualizado às ${new Date(posicao.registrada_em).toLocaleTimeString("pt-BR")}`
                    : "Aguardando o GPS do motorista…"}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </AppScreen>
  );
}
