import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { QrCode, CreditCard, Barcode, ShieldCheck, CheckCircle2, Download } from "lucide-react";
import { AppScreen, Field, inputClass } from "@/components/AppScreen";
import { brl } from "@/data/vanpro";

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
    ],
  }),
  component: Pagamentos,
});

const metodos = [
  { id: "pix", label: "PIX", hint: "Aprovação imediata", icon: QrCode },
  { id: "cartao", label: "Cartão de crédito", hint: "Até 6x sem juros", icon: CreditCard },
  { id: "boleto", label: "Boleto", hint: "Compensa em 1 dia útil", icon: Barcode },
] as const;

const valor = 178;

function Pagamentos() {
  const [metodo, setMetodo] = useState<(typeof metodos)[number]["id"]>("pix");
  const [pago, setPago] = useState(false);

  if (pago) {
    return (
      <AppScreen title="Pagamento aprovado" subtitle="Reserva confirmada">
        <div className="card-elevated flex flex-col items-center p-7 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-[oklch(0.72_0.16_158/0.15)]">
            <CheckCircle2 className="size-11 text-success" />
          </span>
          <h2 className="mt-4 text-lg font-bold">Reserva confirmada!</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Comprovante VP-10482 gerado automaticamente e enviado para o seu e-mail.
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
    <AppScreen title="Pagamento" subtitle="A reserva é confirmada após o pagamento">
      <div className="card-elevated mb-4 p-4">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Salvador → Praia do Forte</span>
          <span>12 Ago · 07:00</span>
        </div>
        <div className="mt-3 flex items-end justify-between border-t border-transparent pt-3">
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
              metodo === id ? "bg-[oklch(0.46_0.25_267/0.10)] shadow-[var(--shadow-brand-soft)] ring-2 ring-primary" : "bg-surface shadow-[var(--shadow-card)]"
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
              Escaneie o QR Code ou copie o código PIX
            </p>
            <button className="press mt-3 w-full rounded-xl bg-surface-2 shadow-[var(--shadow-soft)] px-4 py-3 font-mono text-[11px]">
              00020126VANPRO5204000053039865802BR…
            </button>
          </div>
        )}
        {metodo === "cartao" && (
          <div className="space-y-3.5">
            <Field label="Número do cartão">
              <input className={inputClass} inputMode="numeric" placeholder="0000 0000 0000 0000" />
            </Field>
            <Field label="Nome impresso">
              <input className={inputClass} placeholder="Como está no cartão" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Validade">
                <input className={inputClass} placeholder="MM/AA" />
              </Field>
              <Field label="CVV">
                <input className={inputClass} inputMode="numeric" placeholder="123" />
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

      <button
        onClick={() => setPago(true)}
        className="press mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-brand text-base font-bold text-primary-foreground shadow-[var(--shadow-brand)]"
      >
        Pagar {brl(valor)}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="size-3.5 text-success" /> Ambiente seguro e criptografado
      </p>
    </AppScreen>
  );
}
