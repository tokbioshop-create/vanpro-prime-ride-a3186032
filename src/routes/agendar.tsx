import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Plus, Clock, ShoppingCart, UserRound, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { brl } from "@/data/vanpro";
import { useCarrinho } from "@/data/carrinho";
import { usePainel } from "@/data/painel";
import vanImg from "@/assets/veiculos/van.png.asset.json";
import microImg from "@/assets/veiculos/micro.png.asset.json";
import onibusImg from "@/assets/veiculos/onibus.png.asset.json";

export const Route = createFileRoute("/agendar")({
  head: () => ({
    meta: [
      { title: "Escolher assentos — VanPro" },
      {
        name: "description",
        content:
          "Escolha o veículo, o horário e selecione seus assentos para a viagem executiva VanPro.",
      },
      { property: "og:title", content: "Escolher assentos — VanPro" },
      {
        property: "og:description",
        content: "Van, micro-ônibus ou ônibus: selecione seu assento em poucos toques.",
      },
    ],
  }),
  component: Agendar,
});

type VeiculoTipo = "van" | "micro" | "onibus";

const veiculos: {
  id: VeiculoTipo;
  label: string;
  img: string;
  saida: string;
  fileiras: string[];
  colunas: string[];
  corredorApos: number;
  ocupados: string[];
  valor: number;
}[] = [
  {
    id: "van",
    label: "Van",
    img: vanImg.url,
    saida: "07:00",
    fileiras: ["1", "2", "3", "4"],
    colunas: ["A", "B", "C"],
    corredorApos: 1,
    ocupados: ["1B", "2A", "2C", "3B", "4A", "4C"],
    valor: 95,
  },
  {
    id: "micro",
    label: "Micro-ônibus",
    img: microImg.url,
    saida: "08:30",
    fileiras: ["1", "2", "3", "4", "5", "6"],
    colunas: ["A", "B", "C", "D"],
    corredorApos: 2,
    ocupados: ["1A", "2B", "3C", "4D", "5A", "6B"],
    valor: 82,
  },
  {
    id: "onibus",
    label: "Ônibus",
    img: onibusImg.url,
    saida: "13:00",
    fileiras: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    colunas: ["A", "B", "C", "D"],
    corredorApos: 2,
    ocupados: ["1A", "2B", "4C", "5D", "7A", "8B", "10C"],
    valor: 129,
  },
];

function Seat({
  id,
  state,
  onClick,
}: {
  id: string;
  state: "livre" | "ocupado" | "sel";
  onClick: () => void;
}) {
  const base =
    "press relative flex size-13 items-center justify-center rounded-xl text-[13px] font-extrabold";
  const skin =
    state === "sel"
      ? "bg-gold text-navy shadow-[var(--shadow-gold)]"
      : state === "ocupado"
        ? "bg-primary text-primary-foreground shadow-[var(--shadow-brand-soft)] cursor-not-allowed"
        : "bg-card text-foreground shadow-[var(--shadow-card)]";
  return (
    <button type="button" onClick={onClick} disabled={state === "ocupado"} className={`${base} ${skin}`}>
      {id}
      <span className="absolute inset-x-1.5 bottom-1 h-1.5 rounded-full bg-[oklch(0_0_0/0.12)]" />
    </button>
  );
}

function Agendar() {
  const { config } = usePainel();
  const { itens, adicionar, remover, limpar } = useCarrinho();
  const [tipo, setTipo] = useState<VeiculoTipo>("van");
  const [horarioIdx, setHorarioIdx] = useState(0);

  const disponiveis = veiculos.filter((v) => config.agendamento.tiposVeiculo.includes(v.id));
  const frota = disponiveis.length ? disponiveis : veiculos;
  const veiculo = frota.find((v) => v.id === tipo) ?? frota[0]!;
  const horarios = config.agendamento.horarios.filter((h) => h.saida);
  const horario = horarios[Math.min(horarioIdx, Math.max(0, horarios.length - 1))];
  const lugares = veiculo.fileiras.length * veiculo.colunas.length;
  const horaLabel = horario ? horario.saida : veiculo.saida;

  const itemId = (s: string) => `${veiculo.id}-${horaLabel}-${s}`;

  // seleção espelha o carrinho: o que está no carrinho está selecionado no mapa
  const prefixo = `${veiculo.id}-${horaLabel}-`;
  const assentos = itens.filter((i) => i.id.startsWith(prefixo)).map((i) => i.assento);

  const toggle = (s: string) => {
    if (veiculo.ocupados.includes(s)) return;
    if (assentos.includes(s)) {
      remover(itemId(s));
      return;
    }
    adicionar({
      id: itemId(s),
      veiculo: veiculo.label,
      assento: s,
      horario: horaLabel,
      valor: veiculo.valor,
    });
    toast.success("Agendamento adicionado ao carrinho", {
      description: `${veiculo.label} · assento ${s} · ${horaLabel}`,
    });
  };

  const proximoLivre = () =>
    veiculo.fileiras
      .flatMap((f) => veiculo.colunas.map((c) => f + c))
      .find((id) => !veiculo.ocupados.includes(id) && !assentos.includes(id));

  const limparSelecao = () => limpar();



  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="mx-auto max-w-md px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="bg-brand relative flex items-center gap-3 rounded-3xl px-4 py-4 shadow-[var(--shadow-brand)]">
          <Link
            to="/home"
            aria-label="Voltar"
            className="press flex size-11 shrink-0 items-center justify-center rounded-full border border-[oklch(1_0_0/0.4)] text-primary-foreground"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-xl leading-none font-extrabold text-primary-foreground">
              Van<span className="text-[oklch(0.86_0.15_86)]">Pro</span>
            </p>
            <p className="mt-1 text-[11px] text-[oklch(1_0_0/0.75)]">Transporte Executivo</p>
          </div>
          <Link
            to="/pagamentos"
            aria-label={`Carrinho (${itens.length})`}
            className="press bg-gold text-navy relative flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-[var(--shadow-gold)]"
          >
            <ShoppingCart className="size-5.5" strokeWidth={2.4} />
            {itens.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 py-0.5 text-[10px] font-extrabold text-primary-foreground">
                {itens.length}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-4 px-3 pt-4">
        <section className="card-elevated flex items-center gap-4 p-4">
          <div className="flex flex-col items-center pt-1.5">
            <span className="flex size-4 items-center justify-center rounded-full bg-primary ring-4 ring-[oklch(0.46_0.25_267/0.15)]" />
            <span className="my-1 h-3 w-0.5 rounded bg-border" />
            <span className="bg-gold size-2.5 rounded-full" />
            <span className="my-1 h-3 w-0.5 rounded bg-border" />
            <UserRound className="size-5 text-primary" strokeWidth={2.6} />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Origem
              </p>
              <p className="truncate text-base font-extrabold">Salvador</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Destino
              </p>
              <p className="truncate text-base font-extrabold">Praia do Forte</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1.5 rounded-2xl bg-surface-2 p-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const ultimo = assentos[assentos.length - 1];
                  if (ultimo) toggle(ultimo);
                }}
                className="press flex size-9 items-center justify-center rounded-xl bg-card text-lg leading-none shadow-[var(--shadow-soft)]"
                aria-label="Remover assento"
              >
                −
              </button>
              <span className="w-5 text-center text-lg font-extrabold">{assentos.length}</span>
              <button
                type="button"
                onClick={() => {
                  const livre = proximoLivre();
                  if (livre) toggle(livre);
                }}
                aria-label="Adicionar assento"
                className="press bg-gold text-navy flex size-9 items-center justify-center rounded-xl shadow-[var(--shadow-gold)]"
              >
                <Plus className="size-4.5" strokeWidth={3} />
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {assentos.length === 1 ? "1 assento" : `${assentos.length} assentos`}
            </span>
          </div>
        </section>

        <section className="card-elevated p-4">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${frota.length}, minmax(0, 1fr))` }}
          >
            {frota.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setTipo(v.id);
                  setAssentos([]);
                }}
                className={`press flex items-center justify-center gap-1.5 rounded-full px-2 py-3 text-[10px] font-extrabold whitespace-nowrap transition ${
                  veiculo.id === v.id
                    ? "bg-brand text-primary-foreground shadow-[var(--shadow-brand)]"
                    : "bg-surface-2 text-muted-foreground"
                }`}
              >
                <img
                  src={v.img}
                  alt=""
                  className={`h-5 w-8 shrink-0 object-contain ${veiculo.id === v.id ? "" : "opacity-70"}`}
                />
                {v.label}
              </button>
            ))}
          </div>

          <img
            src={veiculo.img}
            alt={`${veiculo.label} executiva VanPro`}
            width={1000}
            height={700}
            className="mt-4 h-40 w-full object-contain"
          />

          {horarios.length > 0 && (
            <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {horarios.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setHorarioIdx(i)}
                  className={`press flex shrink-0 flex-col items-center rounded-2xl px-3.5 py-2 text-[11px] font-extrabold transition ${
                    horario === h
                      ? "bg-brand text-primary-foreground shadow-[var(--shadow-brand-soft)]"
                      : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  <span>{h.saida}{h.chegada ? ` → ${h.chegada}` : ""}</span>
                  <span className="text-[9px] font-bold opacity-70">
                    {h.chegada ? "Saída · Chegada" : "Saída"}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 grid grid-cols-3 items-center gap-2 border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <Clock className="size-5 shrink-0 text-primary" strokeWidth={2.4} />
              <span className="min-w-0">
                <span className="block text-sm font-extrabold">
                  {horario ? horario.saida : veiculo.saida}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {horario?.chegada ? `Chega ${horario.chegada}` : "Saída"}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 border-x border-border">
              <span className="min-w-0 text-center">
                <span className="block text-sm font-extrabold">{lugares}</span>
                <span className="block text-[11px] text-muted-foreground">Lugares</span>
              </span>
            </div>
            <div className="flex justify-end">
              <span className="flex items-center gap-1.5 rounded-full bg-[oklch(0.46_0.25_267/0.10)] px-3 py-2 text-[11px] font-bold text-primary">
                <UserRound className="size-4" strokeWidth={2.6} /> Motorista
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-surface-2 p-4 shadow-[var(--shadow-card)]">
          <p className="mx-auto mb-4 w-fit rounded-full bg-card px-4 py-2 text-[11px] font-extrabold tracking-widest text-primary uppercase shadow-[var(--shadow-soft)]">
            Selecione seu assento
          </p>

          <div className="rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="bg-card flex size-13 items-center justify-center rounded-xl shadow-[var(--shadow-card)]">
                <span className="size-6 rounded-full border-[3px] border-foreground/70" />
              </span>
              <span className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                Motorista
              </span>
            </div>
            <div className="space-y-2.5">
              {veiculo.fileiras.map((f) => (
                <div key={f} className="flex items-center justify-center gap-2.5">
                  {veiculo.colunas.map((c, i) => {
                    const id = f + c;
                    const state = veiculo.ocupados.includes(id)
                      ? "ocupado"
                      : assentos.includes(id)
                        ? "sel"
                        : "livre";
                    return (
                      <div key={id} className="flex items-center">
                        {i === veiculo.corredorApos && <span className="w-5" />}
                        <Seat id={id} state={state} onClick={() => toggle(id)} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3 rounded-full bg-card px-3 py-2 text-[10px] font-semibold text-muted-foreground shadow-[var(--shadow-soft)]">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-background ring-1 ring-border" /> Disponível
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-primary" /> Ocupado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-gold size-3 rounded-full" /> Selecionado
            </span>
          </div>
        </section>

        <section className="card-elevated flex items-center gap-3 p-4">
          <span className="bg-brand flex size-11 shrink-0 items-center justify-center rounded-2xl text-primary-foreground">
            <ShoppingCart className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">
              {itens.length
                ? `${itens.length} agendamento${itens.length > 1 ? "s" : ""} no carrinho`
                : "Toque em um assento para agendar"}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {itens.length
                ? `Total ${brl(itens.reduce((s, i) => s + i.valor, 0))}`
                : "O carrinho fica na barra inferior"}
            </span>
          </span>
          {assentos.length > 0 && (
            <button
              type="button"
              onClick={limparSelecao}
              aria-label="Limpar seleção"
              className="press flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground"
            >
              <Trash2 className="size-4.5" />
            </button>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
