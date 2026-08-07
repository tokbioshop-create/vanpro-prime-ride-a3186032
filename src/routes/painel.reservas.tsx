import { createFileRoute } from "@tanstack/react-router";
import { Users, CalendarDays } from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { viagens, historico, brl } from "@/data/vanpro";

export const Route = createFileRoute("/painel/reservas")({
  head: () => ({
    meta: [
      { title: "Reservas recebidas — Painel VanPro" },
      {
        name: "description",
        content: "Registro das reservas feitas pelos clientes da sua empresa no VanPro.",
      },
      { property: "og:title", content: "Reservas recebidas — Painel VanPro" },
      { property: "og:description", content: "Acompanhe passageiros, assentos e valores por viagem." },
    ],
  }),
  component: PainelReservas,
});

function PainelReservas() {
  const todas = [...viagens, ...historico];
  const total = todas.reduce((s, v) => s + v.valor, 0);

  return (
    <AppScreen title="Reservas recebidas" subtitle={`${todas.length} registros`} back="/painel">
      <div className="card-elevated mb-4 flex items-center justify-between p-4">
        <div>
          <p className="text-[11px] text-muted-foreground">Faturamento</p>
          <p className="text-xl font-bold text-primary">{brl(total)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">Passageiros</p>
          <p className="flex items-center justify-end gap-1 text-xl font-bold">
            {todas.reduce((s, v) => s + v.assentos.length, 0)} <Users className="size-4 text-primary" />
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {todas.map((v) => (
          <article key={v.id} className="card-elevated p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-primary">{v.id}</span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CalendarDays className="size-3.5" /> {v.data} · {v.hora}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold">
              {v.origem} → {v.destino}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Assentos {v.assentos.join(", ")} · {v.veiculo}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-full bg-surface-2 px-3 py-1 text-[10px] font-bold uppercase">
                {v.status}
              </span>
              <span className="text-sm font-bold text-primary">{brl(v.valor)}</span>
            </div>
          </article>
        ))}
      </div>
    </AppScreen>
  );
}
