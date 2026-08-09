import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Plus, Radio, Square } from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { PainelCard, TextField } from "@/components/PainelForm";
import { MapaViagemLive } from "@/components/MapaViagemLive";
import { usePainel } from "@/data/painel";
import {
  criarViagemRastreada,
  definirCompartilhamento,
  encerrarViagemRastreada,
  listarViagensPainel,
  localizarEndereco,
  type ViagemPainel,
} from "@/lib/rastreio.functions";


export const Route = createFileRoute("/painel/rastreamento")({
  head: () => ({
    meta: [
      { title: "Rastreamento GPS — Painel VanPro" },
      {
        name: "description",
        content:
          "Autorize e encerre o compartilhamento da localização real das viagens da sua empresa.",
      },
      { property: "og:title", content: "Rastreamento GPS — Painel VanPro" },
      {
        property: "og:description",
        content: "Controle de permissão do acompanhamento em tempo real das viagens.",
      },
    ],
  }),
  component: PainelRastreamento,
});

function PainelRastreamento() {
  const { config } = usePainel();
  const listar = useServerFn(listarViagensPainel);
  const criar = useServerFn(criarViagemRastreada);
  const compartilhar = useServerFn(definirCompartilhamento);
  const encerrar = useServerFn(encerrarViagemRastreada);
  const localizar = useServerFn(localizarEndereco);

  const [viagens, setViagens] = useState<ViagemPainel[]>([]);
  const [titulo, setTitulo] = useState("");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [motorista, setMotorista] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [origemCoord, setOrigemCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [destinoCoord, setDestinoCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [localizando, setLocalizando] = useState(false);

  const recarregar = useCallback(async () => {
    setViagens(await listar({}));
  }, [listar]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  // marca origem e destino no mapa automaticamente enquanto o empresário digita
  useEffect(() => {
    const texto = origem.trim();
    if (texto.length < 4) {
      setOrigemCoord(null);
      return;
    }
    let vivo = true;
    setLocalizando(true);
    const t = window.setTimeout(async () => {
      try {
        const r = await localizar({ data: { endereco: texto } });
        if (vivo) setOrigemCoord(r.lat != null && r.lng != null ? { lat: r.lat, lng: r.lng } : null);
      } finally {
        if (vivo) setLocalizando(false);
      }
    }, 800);
    return () => {
      vivo = false;
      window.clearTimeout(t);
    };
  }, [origem, localizar]);

  useEffect(() => {
    const texto = destino.trim();
    if (texto.length < 4) {
      setDestinoCoord(null);
      return;
    }
    let vivo = true;
    setLocalizando(true);
    const t = window.setTimeout(async () => {
      try {
        const r = await localizar({ data: { endereco: texto } });
        if (vivo)
          setDestinoCoord(r.lat != null && r.lng != null ? { lat: r.lat, lng: r.lng } : null);
      } finally {
        if (vivo) setLocalizando(false);
      }
    }, 800);
    return () => {
      vivo = false;
      window.clearTimeout(t);
    };
  }, [destino, localizar]);


  async function novaViagem() {
    if (!titulo.trim()) return;
    setOcupado(true);
    try {
      await criar({
        data: {
          titulo: titulo.trim(),
          origem: origem.trim(),
          destino: destino.trim(),
          motorista: motorista.trim(),
          empresa: config.empresa.nome,
        },
      });
      setTitulo("");
      setOrigem("");
      setDestino("");
      setMotorista("");
      await recarregar();
    } finally {
      setOcupado(false);
    }
  }

  const linkMotorista = (token: string | null) =>
    token ? `${window.location.origin}/motorista?t=${token}` : "";

  return (
    <AppScreen title="Rastreamento GPS" subtitle="Permissão de acompanhamento" back="/painel">
      <PainelCard>
        <TextField label="Nome da viagem" value={titulo} onChange={setTitulo} />
        <TextField
          label="Origem"
          value={origem}
          onChange={setOrigem}
          placeholder="Ex.: Terminal Rodoviário, Salvador BA"
        />
        <TextField
          label="Destino"
          value={destino}
          onChange={setDestino}
          placeholder="Ex.: Aeroporto de Salvador BA"
        />
        <TextField label="Motorista" value={motorista} onChange={setMotorista} />
        <p className="text-[11px] text-muted-foreground">
          Origem e destino ficam fixos no mapa da viagem, visíveis para os clientes mesmo antes do
          motorista iniciar a transmissão. Escreva endereços completos (com cidade e estado).
        </p>

        {/* pré-visualização: marca origem e destino no mapa assim que os endereços são digitados */}
        <div className="overflow-hidden rounded-2xl border border-border">
          <MapaViagemLive
            className="h-56 w-full"
            origem={
              origemCoord
                ? { ...origemCoord, rotulo: "Origem", sub: origem.trim() }
                : null
            }
            destino={
              destinoCoord
                ? { ...destinoCoord, rotulo: "Destino", sub: destino.trim() }
                : null
            }
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {localizando
            ? "Localizando endereços no mapa…"
            : origemCoord && destinoCoord
              ? "Origem e destino marcados no mapa."
              : "Digite os endereços para ver as marcações no mapa."}
        </p>

        <button
          type="button"
          onClick={() => void novaViagem()}
          disabled={ocupado || !titulo.trim() || !origem.trim() || !destino.trim()}
          className="press bg-brand flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          <Plus className="size-4" /> {ocupado ? "Localizando no mapa…" : "Criar viagem"}
        </button>
      </PainelCard>


      <p className="mt-6 mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
        Viagens
      </p>

      <div className="space-y-3">
        {viagens.length === 0 && (
          <p className="text-[11px] text-muted-foreground">Nenhuma viagem cadastrada ainda.</p>
        )}
        {viagens.map((v) => (
          <div key={v.id} className="card-elevated p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{v.titulo}</p>
                <p className="text-[11px] text-muted-foreground">
                  {v.origem || "—"} → {v.destino || "—"}
                  {v.motorista ? ` · ${v.motorista}` : ""}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                  v.encerrada
                    ? "bg-surface-2 text-muted-foreground"
                    : v.compartilhando
                      ? "bg-[oklch(0.72_0.16_158/0.16)] text-success"
                      : "bg-surface-2 text-muted-foreground"
                }`}
              >
                {v.encerrada ? "encerrada" : v.compartilhando ? "ao vivo" : "parada"}
              </span>
            </div>

            <p className="mt-2 text-[10px] text-muted-foreground">
              {v.origem_lat != null && v.destino_lat != null
                ? "Trajeto programado visível no mapa (origem e destino fixos)."
                : "Origem/destino não localizados no mapa — revise os endereços na próxima viagem."}
            </p>

            {!v.encerrada && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-border">
                <MapaViagemLive
                  className="h-52 w-full"
                  viagemId={v.id}
                  ativo={v.compartilhando}
                  origem={
                    v.origem_lat != null && v.origem_lng != null
                      ? { lat: v.origem_lat, lng: v.origem_lng, rotulo: "Origem", sub: v.origem }
                      : null
                  }
                  destino={
                    v.destino_lat != null && v.destino_lng != null
                      ? { lat: v.destino_lat, lng: v.destino_lng, rotulo: "Destino", sub: v.destino }
                      : null
                  }
                />
              </div>
            )}




            {!v.encerrada && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await compartilhar({ data: { id: v.id, compartilhando: !v.compartilhando } });
                    await recarregar();
                  }}
                  className="press flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-surface-2 text-xs font-bold"
                >
                  <Radio className="size-4" />
                  {v.compartilhando ? "Desativar compartilhamento" : "Ativar compartilhamento"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await encerrar({ data: { id: v.id } });
                    await recarregar();
                  }}
                  className="press flex h-11 items-center justify-center rounded-xl bg-surface-2 px-4 text-xs font-bold text-destructive"
                  aria-label="Encerrar viagem"
                >
                  <Square className="size-4" />
                </button>
              </div>
            )}

            {v.token && !v.encerrada && (
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(linkMotorista(v.token))}
                className="press mt-3 flex w-full items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-left font-mono text-[10px] break-all"
              >
                <Copy className="size-3.5 shrink-0" />
                {`/motorista?t=${v.token}`}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
        Envie o link acima para o aparelho do motorista. Enquanto o compartilhamento estiver ativo, a
        posição real do veículo aparece para os clientes em “Acompanhar”.
      </p>
    </AppScreen>
  );
}
