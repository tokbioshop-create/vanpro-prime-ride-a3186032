import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, QrCode, ShieldCheck } from "lucide-react";
import { brl } from "@/data/vanpro";
import { usePainel } from "@/data/painel";
import { useReserva } from "@/data/reserva";
import { criarCobranca } from "@/lib/unicopag.functions";

export const Route = createFileRoute("/pagamentos")({
  head: () => ({
    meta: [
      { title: "Pagamento — VanPro" },
      { name: "description", content: "Finalize sua reserva VanPro com PIX ou cartão de forma segura." },
    ],
  }),
  component: Pagamentos,
});

type Metodo = "pix" | "credito" | "debito";

function Pagamentos() {
  const navigate = useNavigate();
  const { config } = usePainel();
  const reserva = useReserva();
  const cobrar = useServerFn(criarCobranca);
  const [metodo, setMetodo] = useState<Metodo>("pix");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pix, setPix] = useState<string | null>(null);
  const [pago, setPago] = useState(false);
  const [cartao, setCartao] = useState({ numero: "", titular: "", validade: "", cvv: "", parcelas: 1 });

  const valor = reserva.total;

  function validarCartao() {
    const numero = cartao.numero.replace(/\D/g, "");
    if (numero.length < 13 || numero.length > 19) return "Número do cartão inválido.";
    if (cartao.titular.trim().length < 3) return "Informe o nome impresso no cartão.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cartao.validade)) return "Validade deve ser MM/AA.";
    if (!/^\d{3,4}$/.test(cartao.cvv)) return "CVV inválido.";
    return null;
  }

  async function pagar() {
    setErro(null);
    if (metodo !== "pix") {
      const problema = validarCartao();
      if (problema) {
        setErro(problema);
        return;
      }
    }
    setCarregando(true);
    try {
      const r = await cobrar({
        data: {
          valor,
          metodo,
          descricao: `Reserva VanPro · ${reserva.origem} → ${reserva.destino}`,
          ...(metodo !== "pix"
            ? {
                cartao: {
                  numero: cartao.numero.replace(/\D/g, ""),
                  titular: cartao.titular.trim(),
                  validade: cartao.validade,
                  cvv: cartao.cvv,
                  parcelas: metodo === "credito" ? cartao.parcelas : 1,
                },
              }
            : {}),
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
      setErro(e instanceof Error ? e.message : "Falha na comunicação com o serviço de pagamento.");
    } finally {
      setCarregando(false);
    }
  }

  if (pago) {
    return (
      <div className="min-h-screen bg-[oklch(0.14_0.06_268)] px-5 py-8 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="size-12 text-emerald-400" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold">Reserva confirmada!</h1>
          <p className="mt-2 text-sm text-white/65">Pagamento de {brl(valor)} aprovado com sucesso.</p>
          <button onClick={() => navigate({ to: "/reservas" })} className="press mt-8 h-13 w-full rounded-2xl bg-gold font-extrabold text-navy">
            Ver minhas reservas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.14_0.06_268)] text-white">
      <div className="mx-auto min-h-screen max-w-md px-5 pb-8">
        <header className="flex items-center gap-3 py-5">
          <button onClick={() => navigate({ to: "/carrinho" })} aria-label="Voltar" className="press flex size-10 items-center justify-center rounded-full bg-white/10">
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase">VanPro</p>
            <h1 className="text-xl font-extrabold">Finalizar pagamento</h1>
          </div>
        </header>

        <section className="rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-white/50">Total da reserva</p>
              <p className="mt-1 text-3xl font-black text-gold">{brl(valor)}</p>
            </div>
            <div className="rounded-2xl bg-gold/10 p-3 text-gold">
              <ShieldCheck className="size-7" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl bg-black/15 p-3"><span className="block text-white/45">Origem</span><strong className="mt-1 block">{reserva.origem}</strong></div>
            <div className="rounded-2xl bg-black/15 p-3"><span className="block text-white/45">Destino</span><strong className="mt-1 block">{reserva.destino}</strong></div>
            <div className="rounded-2xl bg-black/15 p-3"><span className="block text-white/45">Horário</span><strong className="mt-1 block">{reserva.horario}</strong></div>
            <div className="rounded-2xl bg-black/15 p-3"><span className="block text-white/45">Passageiros</span><strong className="mt-1 block">{reserva.passageiros}</strong></div>
          </div>
        </section>

        <section className="mt-5">
          <h2 className="text-sm font-extrabold">Escolha a forma de pagamento</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button onClick={() => { setMetodo("pix"); setErro(null); }} className={`press rounded-2xl p-3 text-center ring-1 ${metodo === "pix" ? "bg-gold text-navy ring-gold" : "bg-white/[0.06] text-white ring-white/10"}`}>
              <QrCode className="mx-auto size-6" /><span className="mt-2 block text-xs font-bold">PIX</span>
            </button>
            <button onClick={() => { setMetodo("credito"); setErro(null); }} className={`press rounded-2xl p-3 text-center ring-1 ${metodo === "credito" ? "bg-gold text-navy ring-gold" : "bg-white/[0.06] text-white ring-white/10"}`}>
              <CreditCard className="mx-auto size-6" /><span className="mt-2 block text-xs font-bold">Crédito</span>
            </button>
            <button onClick={() => { setMetodo("debito"); setErro(null); }} className={`press rounded-2xl p-3 text-center ring-1 ${metodo === "debito" ? "bg-gold text-navy ring-gold" : "bg-white/[0.06] text-white ring-white/10"}`}>
              <CreditCard className="mx-auto size-6" /><span className="mt-2 block text-xs font-bold">Débito</span>
            </button>
          </div>
        </section>

        {metodo !== "pix" && (
          <section className="mt-4 space-y-3 rounded-3xl bg-white/[0.06] p-4 ring-1 ring-white/10">
            <input inputMode="numeric" autoComplete="cc-number" placeholder="Número do cartão" value={cartao.numero} onChange={(e) => setCartao((c) => ({ ...c, numero: e.target.value.replace(/\D/g, "").slice(0, 19) }))} className="w-full rounded-2xl bg-black/20 px-4 py-3.5 text-sm outline-none ring-1 ring-white/10 focus:ring-gold" />
            <input autoComplete="cc-name" placeholder="Nome impresso no cartão" value={cartao.titular} onChange={(e) => setCartao((c) => ({ ...c, titular: e.target.value }))} className="w-full rounded-2xl bg-black/20 px-4 py-3.5 text-sm outline-none ring-1 ring-white/10 focus:ring-gold" />
            <div className="flex gap-3">
              <input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={cartao.validade} onChange={(e) => setCartao((c) => ({ ...c, validade: e.target.value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2") }))} className="w-1/2 rounded-2xl bg-black/20 px-4 py-3.5 text-sm outline-none ring-1 ring-white/10 focus:ring-gold" />
              <input inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" value={cartao.cvv} onChange={(e) => setCartao((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} className="w-1/2 rounded-2xl bg-black/20 px-4 py-3.5 text-sm outline-none ring-1 ring-white/10 focus:ring-gold" />
            </div>
            {metodo === "credito" && <select value={cartao.parcelas} onChange={(e) => setCartao((c) => ({ ...c, parcelas: Number(e.target.value) }))} className="w-full rounded-2xl bg-black/20 px-4 py-3.5 text-sm outline-none ring-1 ring-white/10">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}x de {brl(valor / n)}</option>)}
            </select>}
          </section>
        )}

        {metodo === "pix" && <div className="mt-4 rounded-3xl bg-gold/10 p-4 text-sm text-white/75 ring-1 ring-gold/20">Você receberá o código PIX para copiar e pagar no aplicativo do seu banco.</div>}
        {erro && <p className="mt-4 rounded-2xl bg-red-500/10 p-3 text-xs font-semibold text-red-300 ring-1 ring-red-500/20">{erro}</p>}

        <button onClick={pagar} disabled={carregando} className="press mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gold text-base font-extrabold text-navy shadow-[var(--shadow-gold)]">
          {carregando ? <Loader2 className="size-5 animate-spin" /> : `Pagar ${brl(valor)}`}
        </button>
        <p className="mt-4 text-center text-[11px] text-white/45">Pagamento seguro · Seus dados de cartão não são armazenados pelo VanPro.</p>

        {pix && <div className="mt-5 rounded-3xl bg-white/[0.06] p-4 ring-1 ring-white/10"><h2 className="text-sm font-extrabold">PIX copia e cola</h2><button onClick={() => navigator.clipboard?.writeText(pix)} className="mt-3 w-full rounded-2xl bg-black/20 p-3 text-left font-mono text-[10px] break-all text-white/70">{pix}</button><button onClick={() => setPix(null)} className="press mt-3 h-11 w-full rounded-2xl bg-white/10 text-sm font-bold">Fechar</button></div>}
      </div>
    </div>
  );
}
