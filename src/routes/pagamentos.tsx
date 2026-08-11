import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2, LockKeyhole } from "lucide-react";
import { brl } from "@/data/vanpro";
import { usePainel } from "@/data/painel";
import { useReserva } from "@/data/reserva";
import { criarCobranca } from "@/lib/unicopag.functions";

export const Route = createFileRoute("/pagamentos")({
  head: () => ({ meta: [{ title: "Área de pagamento — VanMox" }, { name: "description", content: "Área de pagamento VanMox." }] }),
  component: Pagamentos,
});

type Metodo = "pix" | "credito" | "debito";

function PixLogo({ className = "size-8" }: { className?: string }) { return <img src="/pix-logo.svg" className={className} alt="Pix" />; }
function DebitLogo({ className = "size-9" }: { className?: string }) { return <img src="/debit-card.svg" className={className} alt="Cartão de débito" />; }
function VisaLogo() { return <span aria-label="Visa" className="text-[17px] font-black italic tracking-[-0.08em] text-[#1434CB]">VISA</span>; }
function MastercardLogo() { return <span aria-label="Mastercard" className="relative inline-flex h-6 w-9 items-center"><span className="absolute left-0 size-6 rounded-full bg-[#EB001B]"/><span className="absolute right-0 size-6 rounded-full bg-[#F79E1B]"/></span>; }
function CardBrands() { return <div className="flex items-center gap-2" aria-label="Visa e Mastercard"><VisaLogo/><MastercardLogo/></div>; }

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
    if (!temSelecao) { setErro("Selecione uma viagem no carrinho antes de pagar."); return; }
    setErro(null);
    if (metodo !== "pix") { const problema = validarCartao(); if (problema) { setErro(problema); return; } }
    setCarregando(true);
    try {
      const r = await cobrar({ data: { valor, metodo, descricao: `Reserva VanMox · ${reserva.origem} → ${reserva.destino}`, ...(metodo !== "pix" ? { cartao: { numero: cartao.numero.replace(/\D/g, ""), titular: cartao.titular.trim(), validade: cartao.validade, cvv: cartao.cvv, parcelas: metodo === "credito" ? cartao.parcelas : 1 } } : {}), recebedor: { chavePix: config.financeiro.chavePix, subconta: config.financeiro.subconta } } });
      if (!r.ok) { setErro(r.erro ?? "Não foi possível iniciar o pagamento."); return; }
      if (r.pixCopiaECola) setPix(r.pixCopiaECola);
      if (r.linkPagamento) { window.location.href = r.linkPagamento; return; }
      if (r.status === "paid" || r.status === "approved") setPago(true);
    } catch (e) { setErro(e instanceof Error ? e.message : "Falha na comunicação com o serviço de pagamento."); }
    finally { setCarregando(false); }
  }

  if (pago) return <div className="min-h-screen bg-white px-5 py-8 text-[#071342]"><div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center text-center"><div className="flex size-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100"><CheckCircle2 className="size-9 text-emerald-500"/></div><p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[#0b2be3]">VanMox</p><h1 className="mt-2 text-2xl font-extrabold">Reserva confirmada</h1><p className="mt-2 text-sm text-slate-500">Pagamento de {brl(valor)} aprovado com sucesso.</p><button onClick={() => navigate({ to: "/reservas" })} className="press mt-7 h-13 w-full rounded-xl bg-[#0b2be3] font-extrabold text-white">Ver minhas reservas</button></div></div>;

  const optionClass = (selected: boolean) => `press flex min-h-[64px] w-full items-center gap-3 rounded-xl border bg-white px-4 text-left transition ${selected ? "border-[#159b86] bg-[#fbfefd] ring-1 ring-[#159b86]/20" : "border-slate-200"}`;

  return <div className="min-h-screen bg-[#f5f6f8] text-[#071342]"><div className="mx-auto min-h-screen w-full max-w-md bg-white pb-8 shadow-[0_0_35px_rgba(15,23,42,0.05)]">
    <main className="relative">
      <div className="relative">
        <img src="/checkout-banner.svg" alt="Sua viagem, seu conforto. Finalize seu pagamento com segurança." className="block h-[210px] w-full object-cover" />
        <button onClick={() => navigate({ to: "/carrinho" })} aria-label="Voltar ao carrinho" className="absolute left-3 top-3 z-20 flex size-9 items-center justify-center rounded-full bg-[#071342]/75 text-white shadow-lg backdrop-blur-sm"><ArrowLeft className="size-[19px]"/></button>
      </div>
      <div className="px-4 pt-5">
        <section className="border-b border-slate-100 pb-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Área de pagamento</p><h1 className="mt-1 text-[21px] font-extrabold tracking-tight">Finalize sua reserva</h1><p className="mt-1 text-xs leading-relaxed text-slate-500">Confira o total e escolha a forma de pagamento.</p></section>
        {temSelecao ? <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Resumo da viagem</p><p className="mt-1 truncate text-[14px] font-bold">{reserva.origem} <span className="px-1 text-slate-300">→</span> {reserva.destino}</p><p className="mt-1 text-[11px] text-slate-500">{reserva.horario} · {reserva.passageiros} passageiro{reserva.passageiros === 1 ? "" : "s"}</p></div><div className="shrink-0 text-right"><p className="text-[10px] font-medium text-slate-400">Total</p><p className="mt-0.5 text-[23px] font-black tracking-tight">{brl(valor)}</p></div></div></section> : <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center"><p className="text-sm font-bold">Nenhuma viagem selecionada</p><p className="mt-1 text-xs leading-relaxed text-slate-500">Escolha uma viagem no carrinho para que o total apareça e o pagamento seja liberado.</p><button onClick={() => navigate({ to: "/carrinho" })} className="press mt-4 h-10 rounded-lg bg-[#071342] px-5 text-xs font-bold text-white">Voltar ao carrinho</button></section>}
        <section className="mt-6"><div className="flex items-center justify-between"><h2 className="text-[15px] font-extrabold">Forma de pagamento</h2><div className="flex items-center gap-2"><img src="/pix-logo.svg" alt="Pix" className="size-5"/><CardBrands/></div></div><p className="mt-1 text-[11px] text-slate-500">Selecione uma opção para continuar.</p>
          <div className="mt-3 space-y-2">
            <button onClick={() => { setMetodo("pix"); setErro(null); }} className={optionClass(metodo === "pix")}><PixLogo/><div className="min-w-0 flex-1"><p className="text-[13px] font-bold">Pix</p><p className="mt-0.5 text-[10px] text-slate-500">Aprovação imediata</p></div>{metodo === "pix" ? <span className="flex size-5 items-center justify-center rounded-full bg-[#159b86] text-[11px] font-bold text-white">✓</span> : <ChevronRight className="size-4 text-slate-400"/>}</button>
            <button onClick={() => { setMetodo("credito"); setErro(null); }} className={optionClass(metodo === "credito")}><CardBrands/><div className="min-w-0 flex-1"><p className="text-[13px] font-bold">Cartão de crédito</p><p className="mt-0.5 text-[10px] text-slate-500">Visa ou Mastercard</p></div>{metodo === "credito" ? <span className="flex size-5 items-center justify-center rounded-full bg-[#071342] text-[11px] font-bold text-white">✓</span> : <ChevronRight className="size-4 text-slate-400"/>}</button>
            <button onClick={() => { setMetodo("debito"); setErro(null); }} className={optionClass(metodo === "debito")}><DebitLogo/><div className="min-w-0 flex-1"><p className="text-[13px] font-bold">Cartão de débito</p><p className="mt-0.5 text-[10px] text-slate-500">Visa ou Mastercard</p></div>{metodo === "debito" ? <span className="flex size-5 items-center justify-center rounded-full bg-[#071342] text-[11px] font-bold text-white">✓</span> : <ChevronRight className="size-4 text-slate-400"/>}</button>
          </div>
        </section>
        {metodo !== "pix" && <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-[13px] font-bold">Dados do cartão</h3><CardBrands/></div><div className="space-y-2.5"><input inputMode="numeric" autoComplete="cc-number" placeholder="Número do cartão" value={cartao.numero} onChange={e => setCartao(c => ({ ...c, numero: e.target.value.replace(/\D/g, "").slice(0, 19) }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-[13px] outline-none"/><input autoComplete="cc-name" placeholder="Nome impresso no cartão" value={cartao.titular} onChange={e => setCartao(c => ({ ...c, titular: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-[13px] outline-none"/><div className="flex gap-2.5"><input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={cartao.validade} onChange={e => setCartao(c => ({ ...c, validade: e.target.value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2") }))} className="w-1/2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-[13px] outline-none"/><input inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" value={cartao.cvv} onChange={e => setCartao(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} className="w-1/2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-[13px] outline-none"/></div>{metodo === "credito" && <select value={cartao.parcelas} onChange={e => setCartao(c => ({ ...c, parcelas: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-[13px]"><option value={1}>1x de {brl(valor)}</option>{Array.from({ length: 11 }, (_, i) => i + 2).map(n => <option key={n} value={n}>{n}x de {brl(valor / n)}</option>)}</select>}</div></section>}
        {metodo === "pix" && temSelecao && <p className="mt-3 text-[10px] leading-relaxed text-slate-500">O código Pix será gerado após tocar em <strong className="text-[#071342]">Pagar agora</strong>.</p>}
        {erro && <p className="mt-3 rounded-lg bg-red-50 p-3 text-[11px] font-semibold text-red-600 ring-1 ring-red-100">{erro}</p>}
        <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-4 text-[9px] text-slate-400"><LockKeyhole className="size-3.5"/><span>Ambiente seguro · dados protegidos por criptografia</span></div>
        <button onClick={pagar} disabled={carregando || !temSelecao} className="press mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#071342] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{carregando ? <Loader2 className="size-5 animate-spin"/> : temSelecao ? `Pagar ${brl(valor)}` : "Selecione uma viagem para pagar"}</button>
        {pix && <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-sm font-bold">Pix copia e cola</h2><button onClick={() => navigator.clipboard?.writeText(pix)} className="mt-3 w-full rounded-lg bg-slate-50 p-3 text-left font-mono text-[10px] break-all text-slate-600 ring-1 ring-slate-200">{pix}</button><button onClick={() => setPix(null)} className="press mt-3 h-10 w-full rounded-lg bg-[#071342] text-xs font-bold text-white">Fechar</button></div>}
      </div>
    </main>
  </div></div>;
}
