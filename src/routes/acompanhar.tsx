import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ClientOnly, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, MapPin, Radio, ShieldCheck, Signal, Users, WifiOff } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
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
          "Veja origem, destino e a localização GPS real do veículo em tempo real durante a viagem no VanPro.",
      },
      { property: "og:title", content: "Acompanhar viagem — VanPro" },
      {
        property: "og:description",
        content:
          "Trajeto planejado sempre visível e posição real do veículo atualizada automaticamente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Acompanhar,
});

const db = () => comoRastreio(supabase);

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function Acompanhar() {
  const [viagens, setViagens] = useState<ViagemRow[]>([]);
  const [viagemId, setViagemId] = useState<string | null>(null);
  const [posicao, setPosicao] = useState<PosicaoRow | null>(null);
  const [online, setOnline] = useState(true);
  const [carregando, setCarregando] = useState(true);

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

  useEffect(() => {
    if (!viagemId) {
      setPosicao(null);
      return;
    }
    setPosicao(null);
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

  const origem = useMemo(
    () =>
      viagem?.origem_lat != null && viagem?.origem_lng != null
        ? { lat: viagem.origem_lat, lng: viagem.origem_lng, rotulo: "Origem", sub: viagem.origem }
        : null,
    [viagem],
  );
  const destino = useMemo(
    () =>
      viagem?.destino_lat != null && viagem?.destino_lng != null
        ? {
            lat: viagem.destino_lat,
            lng: viagem.destino_lng,
            rotulo: "Destino",
            sub: viagem.destino,
          }
        : null,
    [viagem],
  );

  const emAndamento = Boolean(posicao) && !viagem?.encerrada;

  return (
    <div className="bg-track-bg text-track-foreground min-h-screen">
      <div className="mx-auto max-w-md px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(7rem,calc(6rem+env(safe-area-inset-bottom)))]">
        <header className="track-card flex items-center gap-3 px-4 py-4">
          <Link
            to="/home"
            aria-label="Voltar"
            className="press bg-track-surface-2 text-track-accent flex size-10 shrink-0 items-center justify-center rounded-full"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold">
              Acompanhar <span className="text-track-gold">viagem</span>
            </h1>
            <p className="text-track-muted truncate text-xs">Localização em tempo real</p>
          </div>
          <span className="text-success flex items-center gap-1.5 text-xs font-bold">
            <ShieldCheck className="size-4" /> Seguro
          </span>
        </header>

        {!online && (
          <div className="track-card text-track-muted mt-3 flex items-center gap-2 px-4 py-3 text-[11px]">
            <WifiOff className="size-4" /> Sem internet. O acompanhamento volta sozinho ao
            reconectar.
          </div>
        )}

        {viagens.length > 1 && (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {viagens.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setViagemId(v.id)}
                className={`press shrink-0 rounded-full px-3.5 py-2 text-[11px] font-bold ${
                  v.id === viagemId
                    ? "bg-track-accent text-primary-foreground"
                    : "track-chip text-track-muted"
                }`}
              >
                {v.titulo}
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="track-chip flex items-center gap-2 px-3.5 py-2 text-xs font-bold">
            <span
              className={`size-2 rounded-full ${emAndamento ? "bg-success animate-pulse" : "bg-track-gold"}`}
            />
            {emAndamento
              ? "Viagem em andamento"
              : viagem
                ? "Programada · aguardando início"
                : "Nenhuma viagem ativa"}
          </span>
          <span className="text-track-muted flex items-center gap-1.5 text-[11px]">
            <Signal className={`size-4 ${emAndamento ? "text-success" : ""}`} />
            {posicao ? `Atualizado ${hora(posicao.registrada_em)}` : "Sem GPS ainda"}
          </span>
        </div>

        {/* O mapa fica sempre visível, mesmo antes do motorista transmitir. */}
        <div className="track-card mt-3 overflow-hidden">
          <div className="h-[46vh] min-h-64 w-full">
            <ClientOnly fallback={<div className="bg-track-surface-2 h-full w-full" />}>
              <Suspense fallback={<div className="bg-track-surface-2 h-full w-full" />}>
                <MapaRastreio ponto={posicao} origem={origem} destino={destino} />
              </Suspense>
            </ClientOnly>
          </div>
        </div>

        {carregando ? (
          <p className="text-track-muted mt-3 text-xs">Carregando viagens…</p>
        ) : viagens.length === 0 ? (
          <div className="track-card mt-3 p-6 text-center">
            <MapPin className="text-track-muted mx-auto size-10" />
            <p className="mt-3 text-sm font-bold">Nenhuma viagem sendo compartilhada</p>
            <p className="text-track-muted mt-1 text-[11px]">
              O acompanhamento aparece aqui quando a empresa ativa o compartilhamento da viagem.
            </p>
          </div>
        ) : (
          <>


            <div className="track-card mt-3 p-4">
              <div className="flex items-center gap-3">
                <div className="bg-track-surface-2 text-track-accent flex size-12 shrink-0 items-center justify-center rounded-2xl">
                  <Radio className={`size-6 ${emAndamento ? "animate-pulse" : ""}`} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{viagem?.titulo}</p>
                  <p className="text-track-muted flex items-center gap-2 text-[11px]">
                    <span
                      className={`size-2 rounded-full ${emAndamento ? "bg-success" : "bg-track-gold"}`}
                    />
                    {emAndamento ? "Em andamento" : "Aguardando o GPS do motorista"}
                    {viagem && <span>· Criada às {hora(viagem.criada_em)}</span>}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="relative h-1.5 rounded-full bg-[linear-gradient(90deg,var(--track-accent),var(--track-gold))]">
                  <span className="bg-track-accent absolute top-1/2 left-0 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-[var(--track-surface)]" />
                  <span className="bg-track-gold absolute top-1/2 right-0 size-3.5 translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-[var(--track-surface)]" />
                  {emAndamento && (
                    <span className="bg-track-surface-2 text-track-accent absolute top-1/2 left-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ring-4 ring-[var(--track-surface)]">
                      <Radio className="size-4" />
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-start justify-between gap-4 text-[11px]">
                  <div className="min-w-0">
                    <p className="text-xs font-bold">Origem</p>
                    <p className="text-track-muted truncate">{viagem?.origem || "—"}</p>
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="text-xs font-bold">Destino</p>
                    <p className="text-track-muted truncate">{viagem?.destino || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="track-chip mt-4 flex items-center gap-3 rounded-2xl px-4 py-3">
                <Users className="text-track-accent size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold">
                    {viagem?.compartilhando ? "Compartilhamento ativo" : "Compartilhamento parado"}
                  </p>
                  <p className="text-track-muted truncate text-[11px]">
                    {viagem?.compartilhando
                      ? "Esta viagem está sendo acompanhada"
                      : "A empresa desativou o acompanhamento"}
                  </p>
                </div>
                <ChevronRight className="text-track-muted size-4" />
              </div>

              {!origem && !destino && (
                <p className="text-track-muted mt-3 text-[11px]">
                  Origem e destino ainda não foram localizados no mapa para esta viagem.
                </p>
              )}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
