import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Navigation, Pause, Play, ShieldAlert } from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { enviarPosicao, viagemDoMotorista } from "@/lib/rastreio.functions";
import type { ViagemRow } from "@/lib/rastreio-db";

export const Route = createFileRoute("/motorista")({
  head: () => ({
    meta: [
      { title: "Transmissão GPS do motorista — VanPro" },
      {
        name: "description",
        content: "Tela do motorista: envia a localização GPS real do veículo durante a viagem.",
      },
      { property: "og:title", content: "Transmissão GPS do motorista — VanPro" },
      {
        property: "og:description",
        content: "Envio contínuo da posição real do veículo enquanto a viagem estiver ativa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Motorista,
});

type Fila = { latitude: number; longitude: number; precisao: number | null; velocidade: number | null; rumo: number | null; registrada_em: string };

function Motorista() {
  const buscarViagem = useServerFn(viagemDoMotorista);
  const postar = useServerFn(enviarPosicao);

  const [token, setToken] = useState("");
  const [viagem, setViagem] = useState<ViagemRow | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [transmitindo, setTransmitindo] = useState(false);
  const [ultima, setUltima] = useState<Fila | null>(null);
  const [pendentes, setPendentes] = useState(0);

  const watchId = useRef<number | null>(null);
  const fila = useRef<Fila[]>([]);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t");
    if (t) setToken(t);
  }, []);

  const conectar = useCallback(
    async (valor: string) => {
      setErro(null);
      const r = await buscarViagem({ data: { token: valor } });
      if (!r.ok) {
        setErro(r.erro);
        setViagem(null);
        return;
      }
      setViagem(r.viagem);
    },
    [buscarViagem],
  );

  useEffect(() => {
    if (token) void conectar(token);
  }, [token, conectar]);

  const drenar = useCallback(async () => {
    while (fila.current.length > 0) {
      const item = fila.current[0]!;
      try {
        const r = await postar({ data: { token, ...item } });
        if (!r.ok) {
          setErro(r.erro);
          if (r.erro.includes("encerrada") || r.erro.includes("desativado")) {
            fila.current = [];
            pararTransmissao();
          }
          break;
        }
        fila.current.shift();
        setErro(null);
      } catch {
        // sem internet: mantém na fila e tenta de novo no próximo ponto
        break;
      }
    }
    setPendentes(fila.current.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postar, token]);

  function pararTransmissao() {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    void wakeLock.current?.release();
    wakeLock.current = null;
    setTransmitindo(false);
  }

  async function iniciarTransmissao() {
    setErro(null);
    if (!("geolocation" in navigator)) {
      setErro("Este aparelho não permite acesso ao GPS.");
      return;
    }
    try {
      wakeLock.current = await navigator.wakeLock?.request("screen");
    } catch {
      /* wake lock é opcional */
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const ponto: Fila = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          precisao: pos.coords.accuracy ?? null,
          velocidade: pos.coords.speed ?? null,
          rumo: pos.coords.heading ?? null,
          registrada_em: new Date(pos.timestamp).toISOString(),
        };
        setUltima(ponto);
        fila.current.push(ponto);
        if (fila.current.length > 200) fila.current = fila.current.slice(-200);
        setPendentes(fila.current.length);
        void drenar();
      },
      (e) => setErro(`GPS: ${e.message}`),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );
    setTransmitindo(true);
  }

  useEffect(() => {
    const reenviar = () => void drenar();
    window.addEventListener("online", reenviar);
    const timer = window.setInterval(reenviar, 10000);
    return () => {
      window.removeEventListener("online", reenviar);
      window.clearInterval(timer);
    };
  }, [drenar]);

  useEffect(() => () => pararTransmissao(), []);

  return (
    <AppScreen title="Transmissão GPS" subtitle="Aparelho do motorista" back="/home">
      {!viagem && (
        <div className="card-elevated p-4">
          <label className="text-[11px] font-bold text-muted-foreground uppercase">
            Código do motorista
          </label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value.trim())}
            placeholder="Cole aqui o código recebido da empresa"
            className="mt-2 h-12 w-full rounded-xl bg-surface-2 px-3 text-sm outline-none"
          />
          {erro && <p className="mt-2 text-[11px] text-destructive">{erro}</p>}
        </div>
      )}

      {viagem && (
        <>
          <div className="card-elevated p-4">
            <p className="text-sm font-bold">{viagem.titulo}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {viagem.origem || "—"} → {viagem.destino || "—"}
            </p>
            {!viagem.compartilhando && (
              <p className="mt-3 flex items-center gap-2 text-[11px] text-destructive">
                <ShieldAlert className="size-4" /> A empresa ainda não autorizou o compartilhamento
                desta viagem.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => (transmitindo ? pararTransmissao() : void iniciarTransmissao())}
            disabled={!viagem.compartilhando || viagem.encerrada}
            className="press bg-brand mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {transmitindo ? <Pause className="size-5" /> : <Play className="size-5" />}
            {transmitindo ? "Parar transmissão" : "Iniciar transmissão GPS"}
          </button>

          <div className="card-elevated mt-4 p-4 text-[11px] text-muted-foreground">
            <p className="flex items-center gap-2 font-bold text-foreground">
              <Navigation className="size-4 text-primary" />
              {transmitindo ? "Transmitindo posição real" : "Parado"}
            </p>
            {ultima && (
              <p className="mt-2">
                Última posição: {ultima.latitude.toFixed(6)}, {ultima.longitude.toFixed(6)} ·{" "}
                {new Date(ultima.registrada_em).toLocaleTimeString("pt-BR")}
              </p>
            )}
            {pendentes > 0 && <p className="mt-1">{pendentes} pontos aguardando reconexão.</p>}
            {erro && <p className="mt-2 text-destructive">{erro}</p>}
            <p className="mt-3">
              Mantenha esta tela aberta durante a viagem e autorize a localização como “Permitir o
              tempo todo” nas permissões do Android para continuar enviando em segundo plano.
            </p>
          </div>
        </>
      )}
    </AppScreen>
  );
}
