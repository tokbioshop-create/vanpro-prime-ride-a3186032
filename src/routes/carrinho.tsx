import { createFileRoute, useNavigate } from "@tanstack/react-router";
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

/** Áreas clicáveis em % sobre o protótipo (720 x 1278). */
function Hotspot({
  label,
  left,
  top,
  width,
  height,
  onClick,
}: {
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="press absolute rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
    />
  );
}

function Carrinho() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[oklch(0.14_0.06_268)]">
      <div className="relative mx-auto w-full max-w-md">
        <img
          src={carrinhoHero.url}
          alt="Seu carrinho VanPro: resumo da viagem Salvador para Praia do Forte, valor total e botão confirmar e seguir para pagamento"
          className="block w-full select-none"
        />
        <Hotspot
          label="Alterar viagem"
          left={74}
          top={12.2}
          width={20}
          height={4.2}
          onClick={() => navigate({ to: "/agendar" })}
        />
        <Hotspot
          label="Adicionar cupom de desconto"
          left={4}
          top={83}
          width={92}
          height={7.4}
          onClick={() => navigate({ to: "/agendar" })}
        />
        <Hotspot
          label="Confirmar e seguir para pagamento"
          left={4}
          top={91.5}
          width={92}
          height={7.6}
          onClick={() => navigate({ to: "/pagamentos" })}
        />
      </div>
    </div>
  );
}
