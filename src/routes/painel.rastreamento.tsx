import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Plus, Radio, Square } from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { PainelCard, TextField } from "@/components/PainelForm";
import { usePainel } from "@/data/painel";
import {
  criarViagemRastreada,
  definirCompartilhamento,
  encerrarViagemRastreada,
  listarViagensPainel,
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

  const [viagens, setViagens] = useState<ViagemPainel[]>([]);
  const [titulo, setTitulo] = useState("");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [motorista, setMotorista] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const recarregar = useCallback(async () => {
    setViagens(await listar({}));
  }, [listar]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

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
        <TextField label="Origem" value={origem} onChange={setOrigem} />
        <TextField label="Destino" value={destino} onChange={setDestino} />
        <TextField label="Motorista" value={motorista} onChange={setMotorista} />
        <button
          type="button"
          onClick={() => void novaViagem()}
          disabled={ocupado}
          className="press bg-brand flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          <Plus className="size-4" /> Criar viagem
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
