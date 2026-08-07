import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Download, Star } from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { historico, empresaById, brl } from "@/data/vanpro";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de viagens — VanPro" },
      {
        name: "description",
        content: "Consulte suas viagens concluídas, valores pagos e comprovantes no VanPro.",
      },
      { property: "og:title", content: "Histórico de viagens — VanPro" },
      {
        property: "og:description",
        content: "Todas as viagens executivas já realizadas com o VanPro.",
      },
    ],
  }),
  component: Historico,
});

function Historico() {
  const total = historico.reduce((s, v) => s + v.valor, 0);
  return (
    <AppScreen title="Histórico" subtitle={`${historico.length} viagens concluídas`}>
      <div className="card-elevated mb-4 flex items-center justify-between p-4">
        <div>
          <p className="text-[11px] text-muted-foreground">Total investido</p>
          <p className="text-xl font-bold text-primary">{brl(total)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">Avaliação média</p>
          <p className="flex items-center justify-end gap-1 text-xl font-bold">
            4.9 <Star className="size-4 fill-primary text-primary" />
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {historico.map((v) => (
          <article key={v.id} className="card-elevated p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-success">
                <CheckCircle2 className="size-3.5" /> Concluída
              </span>
              <span className="text-[11px] text-muted-foreground">{v.data}</span>
            </div>
            <p className="mt-2 text-sm font-semibold">
              {v.origem} → {v.destino}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {empresaById(v.empresaId)?.nome} · {v.hora} · Assentos {v.assentos.join(", ")}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-transparent pt-3">
              <span className="text-sm font-bold text-primary">{brl(v.valor)}</span>
              <button className="press flex items-center gap-1.5 rounded-lg bg-surface-2 shadow-[var(--shadow-soft)] px-3 py-2 text-xs font-semibold">
                <Download className="size-3.5" /> Comprovante
              </button>
            </div>
          </article>
        ))}
      </div>
    </AppScreen>
  );
}
