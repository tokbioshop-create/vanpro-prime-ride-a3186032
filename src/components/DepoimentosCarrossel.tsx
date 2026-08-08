import { Star } from "lucide-react";
import { useFeedbacks } from "@/data/feedback";

const padrao = [
  { nome: "Mariana Alves", mensagem: "Van impecável e motorista super pontual. Viagem tranquila!", estrelas: 5 },
  { nome: "Carlos Menezes", mensagem: "Reservei pelo app em 2 minutos. Atendimento nota mil.", estrelas: 5 },
  { nome: "Patrícia Lima", mensagem: "Conforto excelente e preço justo. Já virou meu transporte fixo.", estrelas: 4 },
];

export function DepoimentosCarrossel() {
  const { lista } = useFeedbacks("empresa");
  const itens = [...lista.map((f) => ({ nome: f.nome, mensagem: f.mensagem, estrelas: f.estrelas })), ...padrao];

  return (
    <section className="mt-4">
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="text-sm font-extrabold">O que dizem da empresa</h2>
        <span className="text-[11px] text-muted-foreground">Arraste para ver mais</span>
      </div>

      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {itens.map((f, i) => (
          <article
            key={i}
            className="bg-navy w-[78%] shrink-0 snap-center rounded-2xl p-4 shadow-[var(--shadow-brand-soft)] ring-1 ring-[oklch(1_0_0/0.1)]"
          >
            <div className="flex items-center gap-2">
              <span className="bg-gold text-navy flex size-8 items-center justify-center rounded-full text-xs font-extrabold">
                {f.nome.slice(0, 1).toUpperCase()}
              </span>
              <p className="truncate text-xs font-bold text-[oklch(0.99_0_0)]">{f.nome}</p>
            </div>
            <div className="mt-2 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={
                    "size-3.5 " +
                    (n <= f.estrelas
                      ? "fill-[var(--gold)] text-[var(--gold)]"
                      : "text-[oklch(1_0_0/0.25)]")
                  }
                />
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-[oklch(0.88_0.02_265)]">{f.mensagem}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
