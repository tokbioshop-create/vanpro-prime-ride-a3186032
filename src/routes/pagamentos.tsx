import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { brl } from "@/data/vanpro";
import { usePainel } from "@/data/painel";
import { criarCobranca } from "@/lib/unicopag.functions";
import checkoutHero from "@/assets/checkout-hero.png.asset.json";

export const Route = createFileRoute("/pagamentos")({
  head: () => ({
    meta: [
      { title: "Pagamento — VanPro" },
      {
        name: "description",
        content: "Pague sua reserva com PIX ou cartão e receba a confirmação da reserva na hora.",
      },
      { property: "og:title", content: "Pagamento — VanPro" },
      {
        property: "og:description",
        content: "Confirmação da reserva imediatamente após o pagamento aprovado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagamentos,
});

const valor = 89;

type Metodo = "pix" | "credito" | "debito";

/** Áreas clicáveis em % sobre o protótipo (852 x 1846). */
const areas: Record<Metodo, { top: number; height: number }> = {
  pix: { top: 53.5, height: 8.4 },
  credito: { top: 62.6, height: 8.4 },
  debito: { top: 71.8, height: 8.6 },
};

function Pagamentos() {
  const navigate = useNavigate();
  const { config } = usePainel();
  const [metodo, setMetodo] = useState<Metodo>("pix");
  const [pago, setPago] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pix, setPix] = useState<string | null>(null);
  const cobrar = useServerFn(criarCobranca);

  async function pagar() {
    setErro(null);
    setCarregando(true);
    try {
      const r = await cobrar({
        data: {
          valor,
          metodo: metodo === "pix" ? "pix" : "cartao",
          descricao: "Reserva VanPro · Salvador → Praia do Forte",
          recebedor: {
            chavePix: config.financeiro.chavePix,
            subconta: config.financeiro.subconta,
          },
        },
      });
      if (!r.ok) {
        setErro(r.erro ?? "Não foi possível iniciar o pagamento.");
        return;
      }
      if (r.pixCopiaECola) setPix(r.pixCopiaECola);
      if (r.linkPagamento) {
        window.location.href = r.linkPagamento;
        return;
      }
      if (r.status === "paid" || r.status === "approved") setPago(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha na comunicação com a Unicopag.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(0.14_0.06_268)]">
      <div className="relative mx-auto w-full max-w-md">
        <img
          src={checkoutHero.url}
          alt="Checkout VanPro: total de R$ 89,00, trajeto Salvador para Praia do Forte, formas de pagamento e botão finalizar pagamento"
          className="block w-full select-none"
        />

        {/* voltar */}
        <button
          type="button"
          aria-label="Voltar para o carrinho"
          onClick={() => navigate({ to: "/carrinho" })}
          className="press absolute rounded-full"
          style={{ left: "2%", top: "3.4%", width: "10%", height: "3.4%" }}
        />

        {/* formas de pagamento */}
        {(Object.keys(areas) as Metodo[]).map((id) => (
          <button
            key={id}
            type="button"
            aria-label={`Selecionar ${id}`}
            aria-pressed={metodo === id}
            onClick={() => setMetodo(id)}
            className={`press absolute rounded-2xl transition ${
              metodo === id ? "ring-2 ring-primary" : ""
            }`}
            style={{
              left: "4%",
              width: "92%",
              top: `${areas[id].top}%`,
              height: `${areas[id].height}%`,
            }}
          />
        ))}

        {/* finalizar pagamento */}
        <button
          type="button"
          aria-label={`Finalizar pagamento de ${brl(valor)}`}
          onClick={pagar}
          disabled={carregando}
          className="press absolute flex items-center justify-center rounded-2xl"
          style={{ left: "7%", top: "86.8%", width: "86%", height: "7%" }}
        >
          {carregando && (
            <span className="flex h-full w-full items-center justify-center rounded-2xl bg-[oklch(0.14_0.06_268/0.55)]">
              <Loader2 className="size-6 animate-spin text-primary-foreground" />
            </span>
          )}
        </button>

        {(erro || pix || pago) && (
          <div className="absolute inset-0 flex items-end justify-center bg-[oklch(0.14_0.06_268/0.6)] p-4">
            <div className="card-elevated w-full p-5 text-center">
              {pago && (
                <>
                  <CheckCircle2 className="mx-auto size-12 text-success" />
                  <h2 className="mt-3 text-base font-bold">Reserva confirmada!</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pagamento de {brl(valor)} aprovado.
                  </p>
                  <button
                    onClick={() => navigate({ to: "/reservas" })}
                    className="press bg-brand mt-4 h-12 w-full rounded-xl text-sm font-bold text-primary-foreground"
                  >
                    Ver minhas reservas
                  </button>
                </>
              )}
              {!pago && pix && (
                <>
                  <h2 className="text-sm font-bold">Copie o código PIX</h2>
                  <button
                    onClick={() => navigator.clipboard?.writeText(pix)}
                    className="press mt-3 w-full rounded-xl bg-surface-2 px-4 py-3 font-mono text-[11px] break-all"
                  >
                    {pix}
                  </button>
                  <button
                    onClick={() => setPix(null)}
                    className="press mt-3 h-11 w-full rounded-xl bg-surface-2 text-sm font-semibold"
                  >
                    Fechar
                  </button>
                </>
              )}
              {!pago && !pix && erro && (
                <>
                  <p className="text-xs text-destructive">{erro}</p>
                  <button
                    onClick={() => setErro(null)}
                    className="press mt-3 h-11 w-full rounded-xl bg-surface-2 text-sm font-semibold"
                  >
                    Fechar
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
