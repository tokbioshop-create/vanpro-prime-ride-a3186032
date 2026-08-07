import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { useAvaliacoes, usePainel } from "@/data/painel";
import { empresas } from "@/data/vanpro";

export const Route = createFileRoute("/painel/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliações — Painel VanPro" },
      {
        name: "description",
        content: "Veja os elogios e as estrelas que os clientes deram para a sua empresa no VanPro.",
      },
      { property: "og:title", content: "Avaliações — Painel VanPro" },
      { property: "og:description", content: "Reputação da sua transportadora em tempo real." },
    ],
  }),
  component: PainelAvaliacoes,
});

function PainelAvaliacoes() {
  const { config } = usePainel();
  const { lista } = useAvaliacoes();
  const base = empresas[0]!.nota;
  const media = lista.length
    ? (lista.reduce((s, a) => s + a.estrelas, 0) / lista.length).toFixed(1)
    : base.toFixed(1);

  return (
    <AppScreen title="Avaliações" subtitle={config.empresa.nome} back="/painel">
      <div className="card-elevated flex items-center justify-between p-5">
        <div>
          <p className="text-[11px] text-muted-foreground">Nota média</p>
          <p className="text-3xl font-extrabold text-primary">{media}</p>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`size-5 ${n <= Math.round(Number(media)) ? "fill-[var(--gold)] text-[var(--gold)]" : "text-muted-foreground/40"}`}
            />
          ))}
        </div>
      </div>

      <p className="mt-6 mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
        Feedback dos clientes
      </p>

      {lista.length === 0 ? (
        <p className="card-elevated p-4 text-xs leading-relaxed text-muted-foreground">
          Ainda não há feedbacks. Os clientes avaliam sua empresa pelo botão “Avaliar com estrelas”
          na página da empresa.
        </p>
      ) : (
        <div className="space-y-3">
          {lista.map((a, i) => (
            <article key={i} className="card-elevated p-4">
              <div className="flex items-center justify-between">
                <span className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`size-3.5 ${n <= a.estrelas ? "fill-[var(--gold)] text-[var(--gold)]" : "text-muted-foreground/40"}`}
                    />
                  ))}
                </span>
                <span className="text-[11px] text-muted-foreground">{a.data}</span>
              </div>
              {a.texto && <p className="mt-2 text-sm">{a.texto}</p>}
            </article>
          ))}
        </div>
      )}
    </AppScreen>
  );
}
