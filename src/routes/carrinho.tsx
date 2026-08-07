import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Ticket, Lock, ArrowRight } from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { useCarrinho } from "@/data/carrinho";
import { brl } from "@/data/vanpro";
import carrinhoHero from "@/assets/carrinho-hero.jpg.asset.json";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Seu carrinho — VanPro" },
      {
        name: "description",
        content: "Confira os detalhes da sua viagem, o valor da corrida e siga para o pagamento seguro.",
      },
      { property: "og:title", content: "Seu carrinho — VanPro" },
      { property: "og:description", content: "Resumo da viagem e valor antes do pagamento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Carrinho,
});

function Carrinho() {
  const { itens, total, remover } = useCarrinho();
  const taxa = 0;

  return (
    <AppScreen title="Seu carrinho" subtitle="Confira os detalhes da sua viagem">
      <img
        src={carrinhoHero.url}
        alt="Resumo da viagem VanPro com van executiva, horário de saída e assento"
        className="mb-4 w-full rounded-3xl shadow-[var(--shadow-card)]"
        loading="lazy"
      />

      <div className="card-elevated p-4">
        <h2 className="text-sm font-bold">Valor da corrida</h2>
        <div className="mt-3 space-y-2.5">
          {itens.length === 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Van Executiva</span>
              <span className="font-semibold">{brl(89)}</span>
            </div>
          )}
          {itens.map((i) => (
            <div key={i.id} className="flex items-center justify-between text-sm">
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {i.veiculo} · {i.horario} · {i.assento}
              </span>
              <span className="font-semibold">{brl(i.valor)}</span>
              <button
                onClick={() => remover(i.id)}
                aria-label="Remover item"
                className="press ml-3 text-muted-foreground"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Taxa de serviço</span>
            <span className="font-semibold">{brl(taxa)}</span>
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
          <span className="text-sm font-bold">Total</span>
          <span className="text-2xl font-bold text-primary">
            {brl((itens.length ? total : 89) + taxa)}
          </span>
        </div>
      </div>

      <button className="press card-elevated mt-3 flex w-full items-center gap-3 p-4 text-left">
        <Ticket className="size-5 text-primary" />
        <span className="flex-1">
          <span className="block text-sm font-semibold">Cupom de desconto</span>
          <span className="text-[11px] text-muted-foreground">Adicionar cupom</span>
        </span>
        <ArrowRight className="size-4 text-muted-foreground" />
      </button>

      <Link
        to="/pagamentos"
        className="press bg-brand mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-primary-foreground shadow-[var(--shadow-brand)]"
      >
        <Lock className="size-4.5" /> Confirmar e seguir para pagamento
      </Link>
    </AppScreen>
  );
}
