import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, MapPin, Armchair, Building2 } from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { viagens, empresaById, brl, whatsappLink } from "@/data/vanpro";

export const Route = createFileRoute("/viagens")({
  head: () => ({
    meta: [
      { title: "Viagens agendadas — VanPro" },
      {
        name: "description",
        content: "Acompanhe suas próximas viagens, assentos e fale com o motorista no WhatsApp.",
      },
      { property: "og:title", content: "Viagens agendadas — VanPro" },
      {
        property: "og:description",
        content: "Detalhes das próximas viagens executivas reservadas no VanPro.",
      },
    ],
  }),
  component: Viagens,
});

function Viagens() {
  return (
    <AppScreen title="Viagens agendadas" subtitle={`${viagens.length} próximas viagens`}>
      <div className="space-y-4">
        {viagens.map((v) => {
          const empresa = empresaById(v.empresaId);
          return (
            <article key={v.id} className="card-elevated overflow-hidden">
              <div className="flex items-center justify-between border-b border-transparent bg-surface-2 px-4 py-3">
                <span className="text-xs font-semibold text-muted-foreground">{v.id}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                    v.status === "confirmada"
                      ? "bg-[oklch(0.72_0.16_158/0.16)] text-success"
                      : "bg-[oklch(0.82_0.13_85/0.14)] text-primary"
                  }`}
                >
                  {v.status}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 flex flex-col items-center">
                    <span className="size-2.5 rounded-full bg-primary" />
                    <span className="my-1 h-8 w-px bg-border" />
                    <MapPin className="size-3.5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{v.origem}</p>
                    <p className="mt-5 truncate text-sm font-semibold">{v.destino}</p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-surface-2 p-3">
                    <dt className="text-muted-foreground">Data e hora</dt>
                    <dd className="mt-1 font-semibold">
                      {v.data} · {v.hora}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-surface-2 p-3">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <Armchair className="size-3.5" /> Assentos
                    </dt>
                    <dd className="mt-1 font-semibold">{v.assentos.join(", ")}</dd>
                  </div>
                  <div className="rounded-xl bg-surface-2 p-3">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <Building2 className="size-3.5" /> Empresa
                    </dt>
                    <dd className="mt-1 truncate font-semibold">{empresa?.nome}</dd>
                  </div>
                  <div className="rounded-xl bg-surface-2 p-3">
                    <dt className="text-muted-foreground">Valor</dt>
                    <dd className="mt-1 font-semibold text-primary">{brl(v.valor)}</dd>
                  </div>
                </dl>

                <p className="mt-3 text-[11px] text-muted-foreground">
                  {v.veiculo} · Motorista {v.motorista}
                </p>

                <div className="mt-4 flex gap-2.5">
                  <a
                    href={whatsappLink(
                      v.motoristaWhats,
                      `Olá ${v.motorista}, sou passageiro da viagem ${v.id} (${v.origem} → ${v.destino}).`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[oklch(0.72_0.16_158)] text-sm font-bold text-[oklch(0.18_0.035_265)]"
                  >
                    <MessageCircle className="size-4.5" />
                    Falar com o motorista
                  </a>
                  <Link
                    to="/reservas"
                    className="press flex h-12 items-center justify-center rounded-xl bg-surface-2 shadow-[var(--shadow-soft)] px-4 text-sm font-semibold"
                  >
                    Reserva
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </AppScreen>
  );
}
