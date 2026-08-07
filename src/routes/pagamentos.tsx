import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  QrCode,
  CreditCard,
  Barcode,
  ShieldCheck,
  CheckCircle2,
  Download,
  Lock,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { AppScreen, Field, inputClass } from "@/components/AppScreen";
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
        content: "Pague sua reserva com PIX, cartão de crédito ou boleto e receba o comprovante na hora.",
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

const metodos = [
  { id: "pix", label: "PIX", hint: "Aprovação imediata", icon: QrCode },
  { id: "cartao", label: "Cartão de crédito", hint: "Até 6x sem juros", icon: CreditCard },
  { id: "boleto", label: "Boleto", hint: "Compensa em 1 dia útil", icon: Barcode },
] as const;

const valor = 89;

function Pagamentos() {
  const { config } = usePainel();
  const [metodo, setMetodo] = useState<(typeof metodos)[number]["id"]>("pix");
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
          metodo,
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

  if (pago) {
    return (
      <AppScreen title="Pagamento aprovado" subtitle="Reserva confirmada" back="/carrinho">
        <div className="card-elevated flex flex-col items-center p-7 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-[oklch(0.72_0.16_158/0.15)]">
            <CheckCircle2 className="size-11 text-success" />
          </span>
          <h2 className="mt-4 text-lg font-bold">Reserva confirmada!</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Comprovante gerado automaticamente e enviado para o seu e-mail.
          </p>
          <p className="mt-4 text-2xl font-bold text-primary">{brl(valor)}</p>
          <button className="press mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-2 shadow-[var(--shadow-soft)] text-sm font-semibold">
            <Download className="size-4" /> Baixar comprovante
          </button>
          <Link
            to="/reservas"
            className="press mt-2.5 flex h-12 w-full items-center justify-center rounded-xl bg-brand text-sm font-bold text-primary-foreground"
          >
            Ver minhas reservas
          </Link>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Pagamento" subtitle="A reserva é confirmada após o pagamento" back="/carrinho">
      <img
        src={checkoutHero.url}
        alt="Checkout VanPro: total da corrida, trajeto Salvador para Praia do Forte e formas de pagamento"
        className="mb-4 w-full rounded-3xl shadow-[var(--shadow-card)]"
        loading="lazy"
      />

      <div className="card-elevated mb-4 p-4">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Salvador → Praia do Forte</span>
          <span>Hoje · 05:30</span>
        </div>
        <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">Total a pagar</span>
          <span className="text-2xl font-bold text-primary">{brl(valor)}</span>
        </div>
      </div>

      <h2 className="mb-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Forma de pagamento
      </h2>
      <div className="space-y-2.5">
        {metodos.map(({ id, label, hint, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMetodo(id)}
            className={`press flex w-full items-center gap-3 rounded-2xl p-4 text-left ${
              metodo === id
                ? "bg-[oklch(0.46_0.25_267/0.10)] shadow-[var(--shadow-brand-soft)] ring-2 ring-primary"
                : "bg-surface shadow-[var(--shadow-card)]"
            }`}
          >
            <Icon className="size-5 text-primary" />
            <span className="flex-1">
              <span className="block text-sm font-semibold">{label}</span>
              <span className="text-[11px] text-muted-foreground">{hint}</span>
            </span>
            <span
              className={`size-5 rounded-full border-2 ${
                metodo === id ? "border-primary bg-primary" : "border-border"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="card-elevated mt-4 p-4">
        {metodo === "pix" && (
          <div className="flex flex-col items-center text-center">
            <div className="flex size-40 items-center justify-center rounded-2xl bg-surface-2">
              <QrCode className="size-28 text-foreground/70" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {pix ? "Copie o código PIX abaixo para pagar" : "O código PIX é gerado ao finalizar"}
            </p>
            {pix && (
              <button
                onClick={() => navigator.clipboard?.writeText(pix)}
                className="press mt-3 w-full rounded-xl bg-surface-2 shadow-[var(--shadow-soft)] px-4 py-3 font-mono text-[11px] break-all"
              >
                {pix}
              </button>
            )}
          </div>
        )}
        {metodo === "cartao" && (
          <div className="space-y-3.5">
            <Field label="Número do cartão">
              <input className={inputClass} inputMode="numeric" placeholder="0000 0000 0000 0000" maxLength={19} />
            </Field>
            <Field label="Nome impresso">
              <input className={inputClass} placeholder="Como está no cartão" maxLength={80} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Validade">
                <input className={inputClass} placeholder="MM/AA" maxLength={5} />
              </Field>
              <Field label="CVV">
                <input className={inputClass} inputMode="numeric" placeholder="123" maxLength={4} />
              </Field>
            </div>
          </div>
        )}
        {metodo === "boleto" && (
          <div className="text-center">
            <Barcode className="mx-auto size-16 text-foreground/70" />
            <p className="mt-3 text-xs text-muted-foreground">
              O boleto será gerado e a reserva confirmada após a compensação.
            </p>
          </div>
        )}
      </div>

      {erro && (
        <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-xs text-destructive">{erro}</p>
      )}

      <button
        onClick={pagar}
        disabled={carregando}
        className="press bg-brand mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-primary-foreground shadow-[var(--shadow-brand)] disabled:opacity-70"
      >
        {carregando ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-4.5" />}
        {carregando ? "Processando…" : `Finalizar pagamento · ${brl(valor)}`}
        {!carregando && <ArrowRight className="size-4.5" />}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="size-3.5 text-success" /> Pagamento processado com segurança pela Unicopag
      </p>
    </AppScreen>
  );
}
