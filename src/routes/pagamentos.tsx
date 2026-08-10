import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, LockKeyhole, QrCode, ShieldCheck } from "lucide-react";
import { brl } from "@/data/vanpro";
import { usePainel } from "@/data/painel";
import { useReserva } from "@/data/reserva";
import { criarCobranca } from "@/lib/unicopag.functions";
import carrinhoHero from "@/assets/carrinho-hero.jpg.asset.json";

export const Route = createFileRoute("/pagamentos")({
  head: () => ({ meta: [{ title: "Pagamento — VanMox" }, { name: "description", content: "Finalize sua reserva VanMox com PIX ou cartão de forma segura." }] }),
  component: Pagamentos,
});

type Metodo = "pix" | "credito" | "debito";

function Bandeiras() {
  return <div className="flex items-center gap-2" aria-label="Formas de pagamento aceitas">
    <div className="flex h-9 min-w-[56px] items-center justify-center rounded-lg border border-slate-200 bg-white px-2 shadow-sm"><span className="text-[15px] font-black italic tracking-[-0.08em] text-[#1434CB]">VISA</span></div>
    <div className="flex h-9 min-w-[72px] items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 shadow-sm"><span className="relative flex size-5"><span className="absolute left-0 top-0 size-5 rounded-full bg-[#EB001B]"/><span className="absolute right-0 top-0 size-5 rounded-full bg-[#F79E1B]/90"/></span><span className="text-[8px] font-bold text-slate-700">mastercard</span></div>
    <div className="flex h-9 min-w-[56px] items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 shadow-sm"><svg viewBox="0 0 32 32" className="size-5" aria-hidden="true"><path d="M16 3.5 28 9v7c0 7.1-4.9 11.1-12 12.5C8.9 27.1 4 23.1 4 16V9l12-5.5Z" fill="#32BCAD"/><path d="M10 12.3h5.1c2.8 0 4.9 1.2 4.9 3.7 0 2.4-2.1 3.7-4.9 3.7H13v2.5h-3v-9.9Zm3 2.5v2.4h2c1.3 0 2-.4 2-1.2s-.7-1.2-2-1.2h-2Z" fill="white"/></svg><span className="text-[9px] font-extrabold text-[#32BCAD]">PIX</span></div>
  </div>;
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

  if (pago) return <div className="min-h-screen bg-white px-5 py-8 text-[#020c42]"><div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center text-center"><div className="flex size-20 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100"><CheckCircle2 className="size-12 text-emerald-500" /></div><p className="mt-6 text-xs font-black tracking-[0.18em] text-[#0b2be3] uppercase">VanMox</p><h1 className="mt-2 text-2xl font-extrabold">Reserva confirmada!</h1><p className="mt-2 text-sm text-slate-500">Pagamento de {brl(valor)} aprovado com sucesso.</p><button onClick={() => navigate({ to: "/reservas" })} className="press mt-8 h-14 w-full rounded-2xl bg-[#0b2be3] font-extrabold text-white shadow-[0_10px_28px_rgba(11,43,227,0.22)]">Ver minhas reservas</button></div></div>;

  return <div className="min-h-screen bg-white text-[#020c42]"><div className="mx-auto w-full max-w-md pb-10">
    <header className="relative"><div className="absolute left-3 top-3 z-10"><button onClick={() => navigate({ to: "/carrinho" })} aria-label="Voltar ao carrinho" className="press flex size-10 items-center justify-center rounded-full bg-white/85 text-[#020c42] shadow-md backdrop-blur-sm ring-1 ring-slate-200"><ArrowLeft className="size-5" /></button></div><img src={carrinhoHero.url} alt="Resumo da viagem VanMox" className="block w-full" /></header>

    <main className="px-5">
      <div className="-mt-1 rounded-b-[24px] bg-white pt-4"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black tracking-[0.18em] text-[#0b2be3] uppercase">VanMox</p><h1 className="mt-1 text-2xl font-black tracking-tight text-[#020c42]">Finalizar pagamento</h1></div><Bandeiras /></div></div>

      <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(2,12,66,0.07)]"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-slate-500">Total da reserva</p><p className="mt-1 text-3xl font-black text-[#0b2be3]">{brl(valor)}</p></div><div className="flex size-12 items-center justify-center rounded-2xl bg-[#0b2be3]/8 text-[#0b2be3]"><ShieldCheck className="size-6" /></div></div><div className="mt-5 grid grid-cols-2 gap-2.5 text-xs"><div className="rounded-xl bg-slate-50 p-3"><span className="block text-slate-400">Origem</span><strong className="mt-1 block truncate">{reserva.origem}</strong></div><div className="rounded-xl bg-slate-50 p-3"><span className="block text-slate-400">Destino</span><strong className="mt-1 block truncate">{reserva.destino}</strong></div><div className="rounded-xl bg-slate-50 p-3"><span className="block text-slate-400">Horário</span><strong className="mt-1 block">{reserva.horario}</strong></div><div className="rounded-xl bg-slate-50 p-3"><span className="block text-slate-400">Passageiros</span><strong className="mt-1 block">{reserva.passageiros}</strong></div></div></section>

      <section className="mt-6"><div className="flex items-end justify-between"><div><p className="text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase">Pagamento</p><h2 className="mt-1 text-base font-extrabold">Escolha como pagar</h2></div><div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><LockKeyhole className="size-3.5" /> Compra segura</div></div><div className="mt-3 grid grid-cols-3 gap-2"><button onClick={() => { setMetodo("pix"); setErro(null); }} className={`press rounded-2xl border p-3 text-center ${metodo === "pix" ? "border-[#0b2be3] bg-[#0b2be3]/5" : "border-slate-200 bg-white"}`}><QrCode className="mx-auto size-5 text-[#0b2be3]"/><span className="mt-1 block text-xs font-bold">PIX</span></button><button onClick={() => { setMetodo("credito"); setErro(null); }} className={`press rounded-2xl border p-3 text-center ${metodo === "credito" ? "border-[#0b2be3] bg-[#0b2be3]/5" : "border-slate-200 bg-white"}`}><CreditCard className="mx-auto size-5 text-[#0b2be3]"/><span className="mt-1 block text-xs font-bold">Crédito</span></button><button onClick={() => { setMetodo("debito"); setErro(null); }} className={`press rounded-2xl border p-3 text-center ${metodo === "debito" ? "border-[#0b2be3] bg-[#0b2be3]/5" : "border-slate-200 bg-white"}`}><CreditCard className="mx-auto size-5 text-[#0b2be3]"/><span className="mt-1 block text-xs font-bold">Débito</span></button></div></section>

      {metodo !== "pix" && <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-extrabold">Dados do cartão</h3><Bandeiras /></div><div className="space-y-3"><input inputMode="numeric" autoComplete="cc-number" placeholder="Número do cartão" value={cartao.numero} onChange={e => setCartao(c => ({ ...c, numero: e.target.value.replace(/\D/g, "").slice(0, 19) }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#0b2be3] focus:bg-white"/><input autoComplete="cc-name" placeholder="Nome impresso no cartão" value={cartao.titular} onChange={e => setCartao(c => ({ ...c, titular: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#0b2be3] focus:bg-white"/><div className="flex gap-3"><input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={cartao.validade} onChange={e => setCartao(c => ({ ...c, validade: e.target.value.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2') }))} className="w-1/2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#0b2be3] focus:bg-white"/><input inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" value={cartao.cvv} onChange={e => setCartao(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} className="w-1/2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#0b2be3] focus:bg-white"/>{metodo === "credito" && null}</div>{metodo === "credito" && <select value={cartao.parcelas} onChange={e => setCartao(c => ({ ...c, parcelas: Number(e.target.value) }))} className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#0b2be3]"><option value={1}>1x de {brl(valor)}</option>{Array.from({ length: 11 }, (_, i) => i + 2).map(n => <option key={n} value={n}>{n}x de {brl(valor / n)}</option>)}</select>}</div></section>}
      {metodo === "pix" && <section className="mt-4 rounded-[24px] border border-[#32BCAD]/20 bg-[#32BCAD]/5 p-4"><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-[#32BCAD]/10"><QrCode className="size-6 text-[#32BCAD]"/></div><div><h3 className="text-sm font-extrabold">Pagamento via PIX</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">Ao continuar, o VanMox gera o código PIX para pagamento no seu banco.</p></div></div></section>}
      {erro && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 ring-1 ring-red-100">{erro}</p>}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-center gap-2 text-xs font-bold text-[#020c42]"><LockKeyhole className="size-4 text-emerald-600"/> Pagamento protegido</div><p className="mt-1 pl-6 text-[10px] leading-relaxed text-slate-500">Seus dados de cartão não são armazenados pelo VanMox. O processamento é feito pelo serviço financeiro integrado.</p></div>
      <button onClick={pagar} disabled={carregando} className="press mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b2be3] text-base font-extrabold text-white shadow-[0_10px_28px_rgba(11,43,227,0.24)]">{carregando ? <Loader2 className="size-5 animate-spin"/> : `Confirmar e pagar ${brl(valor)}`}</button>
      <div className="mt-4 flex justify-center"><Bandeiras /></div><p className="mt-3 text-center text-[10px] leading-relaxed text-slate-400">Ao continuar, você confirma os dados da reserva e autoriza o processamento do pagamento.</p>
      {pix && <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4 shadow-lg"><h2 className="text-sm font-extrabold">PIX copia e cola</h2><button onClick={() => navigator.clipboard?.writeText(pix)} className="mt-3 w-full rounded-2xl bg-slate-50 p-3 text-left font-mono text-[10px] break-all text-slate-600 ring-1 ring-slate-200">{pix}</button><button onClick={() => setPix(null)} className="press mt-3 h-11 w-full rounded-2xl bg-[#020c42] text-sm font-bold text-white">Fechar</button></div>}
    </main>
  </div></div>;
}
