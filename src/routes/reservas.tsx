import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, QrCode, Ticket } from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { viagens, historico, empresaById, brl } from "@/data/vanpro";

export const Route = createFileRoute("/reservas")({
  head: () => ({
    meta: [
      { title: "Minhas reservas — VanPro" },
      {
        name: "description",
        content: "Bilhetes, comprovantes e códigos de embarque das suas reservas VanPro.",
      },
      { property: "og:title", content: "Minhas reservas — VanPro" },
      { property: "og:description", content: "Acesse seus comprovantes de viagem a qualquer hora." },
    ],
  }),
  component: Reservas,
});

function Reservas() {
  const todas = [...viagens, ...historico];
  return (
    <AppScreen title="Minhas reservas" subtitle={`${todas.length} bilhetes`}>
      <div className="space-y-4">
        {todas.map((v) => (
          <article key={v.id} className="card-elevated relative overflow-hidden">
            <div className="bg-brand px-4 py-3">
              <p className="flex items-center gap-2 text-xs font-bold text-primary-foreground">
                <Ticket className="size-4" /> Bilhete {v.id}
              </p>
            </div>
            <span className="absolute top-[52px] -left-2.5 size-5 rounded-full bg-background" />
            <span className="absolute top-[52px] -right-2.5 size-5 rounded-full bg-background" />
            <div className="p-4">
              <p className="text-sm font-semibold">
                {v.origem} → {v.destino}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {empresaById(v.empresaId)?.nome} · {v.data} · {v.hora}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex size-20 items-center justify-center rounded-xl bg-surface-2">
                  <QrCode className="size-12 text-foreground/70" />
                </div>
                <dl className="flex-1 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Assentos</dt>
                    <dd className="font-semibold">{v.assentos.join(", ")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Situação</dt>
                    <dd className="font-semibold capitalize">{v.status}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total</dt>
                    <dd className="font-bold text-primary">{brl(v.valor)}</dd>
                  </div>
                </dl>
              </div>
              <div className="mt-4 flex gap-2.5">
                <button className="press flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-surface-2 shadow-[var(--shadow-soft)] text-xs font-semibold">
                  <Download className="size-4" /> Comprovante
                </button>
                <Link
                  to="/viagens"
                  className="press flex h-11 flex-1 items-center justify-center rounded-xl bg-surface-2 shadow-[var(--shadow-soft)] text-xs font-semibold"
                >
                  Ver viagem
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppScreen>
  );
}
