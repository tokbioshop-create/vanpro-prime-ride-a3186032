import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, ChevronRight, Search } from "lucide-react";
import { AppScreen, inputClass } from "@/components/AppScreen";
import { empresas } from "@/data/vanpro";

export const Route = createFileRoute("/empresas")({
  head: () => ({
    meta: [
      { title: "Empresas cadastradas — VanPro" },
      {
        name: "description",
        content: "Veja as empresas de vans e micro-ônibus executivos cadastradas no VanPro.",
      },
      { property: "og:title", content: "Empresas cadastradas — VanPro" },
      {
        property: "og:description",
        content: "Frotas, rotas e horários das transportadoras parceiras.",
      },
    ],
  }),
  component: Empresas,
});

function Empresas() {
  return (
    <AppScreen title="Empresas cadastradas" subtitle={`${empresas.length} parceiras verificadas`}>
      <div className="relative mb-4">
        <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <input className={inputClass + " pl-11"} placeholder="Buscar empresa ou cidade" />
      </div>
      <div className="space-y-3">
        {empresas.map((e) => (
          <Link
            key={e.id}
            to="/empresa/$id"
            params={{ id: e.id }}
            className="press card-elevated flex items-center gap-3.5 p-4"
          >
            <span className="flex size-13 items-center justify-center rounded-2xl bg-brand text-base font-bold text-primary-foreground">
              {e.sigla}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{e.nome}</span>
              <span className="block text-[11px] text-muted-foreground">{e.cidade}</span>
              <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-primary">
                <Star className="size-3 fill-primary" /> {e.nota} · {e.frota.length} veículos
              </span>
            </span>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </AppScreen>
  );
}
