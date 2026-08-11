import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2, LockKeyhole } from "lucide-react";
import { brl } from "@/data/vanpro";
import { usePainel } from "@/data/painel";
import { useReserva } from "@/data/reserva";
import { criarCobranca } from "@/lib/unicopag.functions";

export const Route = createFileRoute("/pagamentos")({
  head: () => ({
    meta: [
      { title: "Área de pagamento — VanMox" },
      { name: "description", content: "Área de pagamento VanMox." },
    ],
  }),
  component: Pagamentos,
});

type Metodo = "pix" | "credito" | "debito";

function PixLogo({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label="Pix">
      <g fill="#32BCAD">
        <path d="M24 4.5c2.7 0 5.3 1.1 7.2 3l9.3 9.3a5.9 5.9 0 0 1 0 8.4l-9.3 9.3a10.2 10.2 0 0 1-14.4 0l-9.3-9.3a5.9 5.9 0 0 1 0-8.4l9.3-9.3a10.2 10.2 0 0 1 7.2-3Z" />
        <path fill="white" d="m16.1 17 3.9-3.9a5.6 5.6 0 0 1 8 0l3.8 3.8-2.9 2.9-3.5-3.5a2 2 0 0 0-2.8 0l-3.6 3.6-2.9-2.9Zm15.8 14-3.9 3.9a5.6 5.6 0 0 1-8 0l-3.8-3.8 2.9-2.9 3.5 3.5a2 2 0 0 0 2.8 0l3.6-3.6 2.9 2.9Z" />
      </g>
    </svg>
  );
}

function VisaLogo() {
  return <span aria-label="Visa" className="text-[21px] font-black italic tracking-[-0.08em] text-[#1434CB]">VISA</span>;
}

function MastercardLogo() {
  return (
    <span aria-label="Mastercard" className="relative inline-flex h-7 w-10 items-center">
      <span className="absolute left-0 size-7 rounded-full bg-[#EB001B]" />
      <span className="absolute right-0 size-7 rounded-full bg-[#F79E1B]" />
    </span>
  );
}

function CardBrands() {
  return (
    <div className="flex items-center gap-2" aria-label="Visa e Mastercard">
      <VisaLogo />
      <MastercardLogo />
    </div>
  );
}

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
  const temSelecao = reserva.itens.length > 0 && valor > 0;

  function validarCartao() {
    const numero = cartao.numero.replace(/\D/g, "");
    if (numero.length < 13 || numero.length > 19) return "Número do cartão inválido.";
    if (cartao.titular.trim().length < 3) return "Informe o nome impresso no cartão.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cartao.validade)) return "Validade deve ser MM/AA.";
    if (!/^\d{3,4}$/.test(cartao.cvv)) return "CVV inválido.";
    return null;
  }

  async function pagar() {
    if (!temSelecao) {
      setErro("Selecione uma viagem no carrinho antes de pagar.");
      return;
    }
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
          descricao: `Reserva VanMox · ${reserva.origem} → ${reserva.destino}`,
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
          recebedor: { chavePix: config.financeiro.chavePix, subconta: config.financeiro.subconta },
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
      <div className="min-h-screen bg-white px-5 py-8 text-[#020c42]">
        <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
            <CheckCircle2 className="size-12 text-emerald-500" />
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#0b2be3]">VanMox</p>
          <h1 className="mt-2 text-2xl font-extrabold">Reserva confirmada!</h1>
          <p className="mt-2 text-sm text-slate-500">Pagamento de {brl(valor)} aprovado com sucesso.</p>
          <button onClick={() => navigate({ to: "/reservas" })} className="press mt-8 h-14 w-full rounded-2xl bg-[#0b2be3] font-extrabold text-white shadow-[0_10px_28px_rgba(11,43,227,0.22)]">
            Ver minhas reservas
          </button>
        </div>
      </div>
    );
  }

  const optionClass = (selected: boolean) =>
    `press flex min-h-[68px] w-full items-center gap-4 rounded-[19px] border bg-white px-4 text-left shadow-[0_4px_14px_rgba(2,12,66,0.045)] transition ${
      selected ? "border-[#16a085] ring-1 ring-[#16a085]" : "border-slate-100"
    }`;

  return (
    <div className="min-h-screen bg-white text-[#071342]">
      <div className="mx-auto w-full max-w-md bg-white px-4 pb-10">
        <header className="flex h-16 items-center border-b border-slate-100">
          <button onClick={() => navigate({ to: "/carrinho" })} aria-label="Voltar ao carrinho" className="flex size-10 items-center justify-center rounded-full text-[#071342]">
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1 text-center pr-10">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0b2be3]">VanMox</p>
            <h1 className="text-[20px] font-black tracking-tight">Área de pagamento</h1>
          </div>
        </header>

        <main className="pt-5">
          {temSelecao ? (
            <section className="rounded-[22px] border border-slate-100 bg-white px-5 py-5 shadow-[0_8px_24px_rgba(2,12,66,0.07)]">
              <p className="text-xs font-semibold text-slate-500">Total a pagar</p>
              <p className="mt-1 text-[38px] font-black leading-none tracking-tight text-[#0b2be3]">{brl(valor)}</p>
            </section>
          ) : (
            <section className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center">
              <p className="text-sm font-extrabold text-[#071342]">Nenhuma viagem selecionada</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Escolha uma viagem no carrinho para que o valor apareça e o pagamento seja liberado.</p>
              <button onClick={() => navigate({ to: "/carrinho" })} className="press mt-4 h-11 rounded-xl bg-[#0b2be3] px-5 text-sm font-extrabold text-white">Voltar ao carrinho</button>
            </section>
          )}

          <section className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-[17px] font-extrabold tracking-tight">Forma de pagamento</h2>
              <div className="flex items-center gap-2"><PixLogo className="size-6" /><CardBrands /></div>
            </div>
            <p className="mt-1 text-xs text-slate-500">Escolha como deseja pagar.</p>

            <div className="mt-3 space-y-2.5">
              <button onClick={() => { setMetodo("pix"); setErro(null); }} className={optionClass(metodo === "pix")}>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e9fbf8]"><PixLogo className="size-8" /></div>
                <div className="min-w-0 flex-1"><p className="text-[14px] font-extrabold">Pix</p><p className="mt-0.5 text-[10px] font-medium text-[#16a085]">Aprovação imediata</p></div>
                {metodo === "pix" ? <span className="flex size-6 items-center justify-center rounded-full bg-[#159b55] text-[13px] font-bold text-white">✓</span> : <ChevronRight className="size-5 text-slate-400" />}
              </button>
              <button onClick={() => { setMetodo("credito"); setErro(null); }} className={optionClass(metodo === "credito")}>
                <div className="flex w-[88px] shrink-0 items-center justify-start"><CardBrands /></div>
                <div className="min-w-0 flex-1"><p className="text-[14px] font-extrabold">Cartão de crédito</p><p className="mt-0.5 text-[10px] text-slate-500">Visa ou Mastercard</p></div>
                {metodo === "credito" ? <span className="flex size-6 items-center justify-center rounded-full bg-[#0b2be3] text-[13px] font-bold text-white">✓</span> : <ChevronRight className="size-5 text-slate-400" />}
              </button>
              <button onClick={() => { setMetodo("debito"); setErro(null); }} className={optionClass(metodo === "debito")}>
                <div className="flex w-[88px] shrink-0 items-center justify-start"><CardBrands /></div>
                <div className="min-w-0 flex-1"><p className="text-[14px] font-extrabold">Cartão de débito</p><p className="mt-0.5 text-[10px] text-slate-500">Visa ou Mastercard</p></div>
                {metodo === "debito" ? <span className="flex size-6 items-center justify-center rounded-full bg-[#0b2be3] text-[13px] font-bold text-white">✓</span> : <ChevronRight className="size-5 text-slate-400" />}
              </button>
            </div>
          </section>

          {metodo !== "pix" && (
            <section className="mt-4 rounded-[20px] border border-slate-100 bg-white p-4 shadow-[0_5px_18px_rgba(2,12,66,0.05)]">
              <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-extrabold">Dados do cartão</h3><CardBrands /></div>
              <div className="space-y-2.5">
                <input inputMode="numeric" autoComplete="cc-number" placeholder="Número do cartão" value={cartao.numero} onChange={e => setCartao(c => ({ ...c, numero: e.target.value.replace(/\D/g, "").slice(0, 19) }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0b2be3] focus:bg-white" />
                <input autoComplete="cc-name" placeholder="Nome impresso no cartão" value={cartao.titular} onChange={e => setCartao(c => ({ ...c, titular: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0b2be3] focus:bg-white" />
                <div className="flex gap-2.5"><input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={cartao.validade} onChange={e => setCartao(c => ({ ...c, validade: e.target.value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2") }))} className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0b2be3] focus:bg-white" /><input inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" value={cartao.cvv} onChange={e => setCartao(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0b2be3] focus:bg-white" /></div>
                {metodo === "credito" && <select value={cartao.parcelas} onChange={e => setCartao(c => ({ ...c, parcelas: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0b2be3]"><option value={1}>1x de {brl(valor)}</option>{Array.from({ length: 11 }, (_, i) => i + 2).map(n => <option key={n} value={n}>{n}x de {brl(valor / n)}</option>)}</select>}
              </div>
            </section>
          )}

          {metodo === "pix" && temSelecao && <div className="mt-4 rounded-[16px] border border-[#32BCAD]/15 bg-[#f1fcfa] px-4 py-3 text-[10px] leading-relaxed text-slate-600">O código Pix será gerado ao tocar em <strong className="text-[#071342]">Pagar agora</strong>.</div>}
          {erro && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 ring-1 ring-red-100">{erro}</p>}

          <div className="mt-5 flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-[10px] font-medium text-slate-500"><LockKeyhole className="size-4 text-[#071342]" /><span>Pagamento seguro · dados protegidos com criptografia SSL</span></div>
          <button onClick={pagar} disabled={carregando || !temSelecao} className="press mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b2be3] text-base font-extrabold text-white shadow-[0_10px_28px_rgba(11,43,227,0.24)] disabled:cursor-not-allowed disabled:opacity-40">
            {carregando ? <Loader2 className="size-5 animate-spin" /> : temSelecao ? `Pagar agora · ${brl(valor)}` : "Selecione uma viagem para pagar"}
          </button>

          {pix && <div className="mt-4 rounded-[22px] border border-slate-200 bg-white p-4 shadow-lg"><h2 className="text-sm font-extrabold">PIX copia e cola</h2><button onClick={() => navigator.clipboard?.writeText(pix)} className="mt-3 w-full rounded-xl bg-slate-50 p-3 text-left font-mono text-[10px] break-all text-slate-600 ring-1 ring-slate-200">{pix}</button><button onClick={() => setPix(null)} className="press mt-3 h-11 w-full rounded-xl bg-[#071342] text-sm font-bold text-white">Fechar</button></div>}
        </main>
      </div>
    </div>
  );
}
