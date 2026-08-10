import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, LockKeyhole, QrCode, ShieldCheck } from "lucide-react";
import carrinhoHero from "@/assets/carrinho-hero.jpg.asset.json";
import { brl } from "@/data/vanpro";
import { usePainel } from "@/data/painel";
import { useReserva } from "@/data/reserva";
import { criarCobranca } from "@/lib/unicopag.functions";

export const Route = createFileRoute("/pagamentos")({
  head: () => ({ meta: [{ title: "Pagamento seguro — VanPro" }, { name: "description", content: "Finalize sua reserva VanPro com PIX ou cartão em um ambiente de pagamento seguro." }] }),
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
    if (metodo !== "pix") { const problema = validarCartao(); if (problema) { setErro(problema); return; } }
    setCarregando(true);
    try {
      const r = await cobrar({ data: { valor, metodo, descricao: `Reserva VanPro · ${reserva.origem} → ${reserva.destino}`, ...(metodo !== "pix" ? { cartao: { numero: cartao.numero.replace(/\D/g, ""), titular: cartao.titular.trim(), validade: cartao.validade, cvv: cartao.cvv, parcelas: metodo === "credito" ? cartao.parcelas : 1 } } : {}), recebedor: { chavePix: config.financeiro.chavePix, subconta: config.financeiro.subconta } } });
      if (!r.ok) { setErro(r.erro ?? "Não foi possível iniciar o pagamento."); return; }
      if (r.pixCopiaECola) setPix(r.pixCopiaECola);
      if (r.linkPagamento) { window.location.href = r.linkPagamento; return; }
      if (r.status === "paid" || r.status === "approved") setPago(true);
    } catch (e) { setErro(e instanceof Error ? e.message : "Falha na comunicação com o serviço de pagamento."); }
    finally { setCarregando(false); }
  }

  if (pago) return (
    <div className="min-h-screen bg-white px-5 py-8 text-[#020c42]"><div className="mx-auto flex min-h-[82vh] max-w-md flex-col items-center justify-center text-center"><div className="flex size-24 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200"><CheckCircle2 className="size-14 text-emerald-600" /></div><p className="mt-6 text-[10px] font-black tracking-[0.24em] text-[#0b2be3] uppercase">VanPro · Pagamento aprovado</p><h1 className="mt-2 text-3xl font-black">Reserva confirmada!</h1><p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">Pagamento de {brl(valor)} aprovado com sucesso. Sua viagem está confirmada.</p><button onClick={() => navigate({ to: "/reservas" })} className="press mt-8 h-14 w-full rounded-2xl bg-[#0b2be3] font-extrabold text-white shadow-lg">Ver minhas reservas</button></div></div>
  );

  return (
    <div className="min-h-screen bg-white text-[#020c42]">
      <div className="mx-auto w-full max-w-md pb-10">
        <div className="relative h-[178px] overflow-hidden bg-[#020c42] shadow-sm">
          <img src={carrinhoHero.url} alt="VanPro — pagamento seguro" className="block w-full select-none object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/25" />
          <button type="button" onClick={() => navigate({ to: "/carrinho" })} aria-label="Voltar ao carrinho" className="press absolute top-3 left-3 z-10 flex size-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm ring-1 ring-white/30"><ArrowLeft className="size-5" /></button>
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4"><div><p className="text-[10px] font-black tracking-[0.18em] text-[#0b2be3] uppercase">VanPro</p><h1 className="mt-1 text-2xl font-black">Pagamento seguro</h1></div><div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200"><LockKeyhole className="size-3.5" /> Seguro</div></div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="flex items-center justify-center gap-2.5"><div className="flex h-10 min-w-[70px] items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm"><span className="text-[13px] font-black italic tracking-tight text-[#1434CB]">VISA</span></div><div className="flex h-10 min-w-[100px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white shadow-sm"><span className="size-5 rounded-full bg-[#EB001B]" /><span className="-ml-2 size-5 rounded-full bg-[#F79E1B]/90" /><span className="ml-0 text-[9px] font-black tracking-tight text-slate-600">mastercard</span></div><div className="flex h-10 min-w-[70px] items-center justify-center gap-1 rounded-lg border border-[#32BCAD]/30 bg-[#32BCAD]/5 shadow-sm"><QrCode className="size-4 text-[#159d8f]" /><span className="text-[12px] font-black text-[#159d8f]">PIX</span></div></div><p className="mt-2 text-center text-[9px] font-semibold text-slate-400">Formas de pagamento aceitas</p></div>

          <section className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Resumo da viagem</p><p className="mt-1 text-sm font-extrabold">{reserva.origem} → {reserva.destino}</p></div><ShieldCheck className="size-7 text-[#0b2be3]" /></div><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-white p-2 ring-1 ring-slate-100"><span className="block text-[9px] text-slate-400">Horário</span><strong className="text-xs">{reserva.horario}</strong></div><div className="rounded-xl bg-white p-2 ring-1 ring-slate-100"><span className="block text-[9px] text-slate-400">Assentos</span><strong className="text-xs">{reserva.assentos}</strong></div><div className="rounded-xl bg-white p-2 ring-1 ring-slate-100"><span className="block text-[9px] text-slate-400">Passageiros</span><strong className="text-xs">{reserva.passageiros}</strong></div></div><div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3"><span className="text-xs font-semibold text-slate-500">Total</span><strong className="text-2xl font-black text-[#0b2be3]">{brl(valor)}</strong></div></section>

          <section className="mt-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">Etapa final</p><h2 className="mt-1 text-base font-extrabold">Escolha o pagamento</h2></div><span className="text-[10px] font-semibold text-slate-400">Ambiente protegido</span></div><div className="mt-3 grid grid-cols-3 gap-2">{([['pix', QrCode, 'PIX'], ['credito', CreditCard, 'Crédito'], ['debito', CreditCard, 'Débito']] as const).map(([id, Icon, label]) => <button key={id} onClick={() => { setMetodo(id); setErro(null); }} className={`press rounded-2xl p-3 ring-1 transition-all ${metodo === id ? 'bg-[#0b2be3] text-white ring-[#0b2be3] shadow-md' : 'bg-white text-[#020c42] ring-slate-200'}`}><Icon className="mx-auto size-5" /><span className="mt-1.5 block text-[11px] font-extrabold">{label}</span></button>)}</div></section>

          {metodo !== 'pix' && <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-extrabold">Dados do cartão</h3><div className="flex gap-1.5"><span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[9px] font-black italic text-[#1434CB]">VISA</span><span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[9px] font-black text-slate-700">●● mastercard</span></div></div><div className="space-y-3"><input inputMode="numeric" autoComplete="cc-number" placeholder="Número do cartão" value={cartao.numero} onChange={e => setCartao(c => ({ ...c, numero: e.target.value.replace(/\D/g, '').slice(0, 19) }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#0b2be3] focus:ring-2 focus:ring-blue-100" /><input autoComplete="cc-name" placeholder="Nome impresso no cartão" value={cartao.titular} onChange={e => setCartao(c => ({ ...c, titular: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#0b2be3] focus:ring-2 focus:ring-blue-100" /><div className="flex gap-3"><input inputMode="numeric" autoComplete="cc-exp" placeholder="Validade MM/AA" value={cartao.validade} onChange={e => setCartao(c => ({ ...c, validade: e.target.value.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2') }))} className="w-1/2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#0b2be3]" /><input inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" value={cartao.cvv} onChange={e => setCartao(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} className="w-1/2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#0b2be3]" /></div>{metodo === 'credito' && <select value={cartao.parcelas} onChange={e => setCartao(c => ({ ...c, parcelas: Number(e.target.value) }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none"><option value={1}>1x de {brl(valor)}</option>{Array.from({ length: 11 }, (_, i) => i + 2).map(n => <option key={n} value={n}>{n}x de {brl(valor / n)}</option>)}</select>}</div></section>}

          {metodo === 'pix' && <section className="mt-4 rounded-3xl border border-[#32BCAD]/30 bg-[#32BCAD]/5 p-4"><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-[#32BCAD] text-white"><QrCode className="size-6" /></div><div><h3 className="text-sm font-extrabold">Pague com PIX</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">Rápido, seguro e confirmado após o pagamento no seu banco.</p></div></div></section>}
          {erro && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 ring-1 ring-red-100">{erro}</p>}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-center gap-2"><LockKeyhole className="size-4 text-emerald-600" /><span className="text-[11px] font-bold">Compra segura</span></div><p className="mt-1 pl-6 text-[10px] leading-relaxed text-slate-500">Seus dados são enviados para o serviço de pagamento integrado e não ficam armazenados pelo VanPro.</p></div>
          <button onClick={pagar} disabled={carregando} className="press mt-4 flex h-15 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b2be3] text-base font-black text-white shadow-lg shadow-blue-200">{carregando ? <Loader2 className="size-5 animate-spin" /> : `Confirmar e pagar ${brl(valor)}`}</button>
          <p className="px-5 pt-3 text-center text-[9px] leading-relaxed text-slate-400">Ao continuar, você confirma os dados da reserva e autoriza o processamento do pagamento.</p>
          {pix && <div className="mt-5 rounded-3xl border border-[#0b2be3]/20 bg-blue-50 p-4"><h2 className="text-sm font-extrabold">PIX copia e cola</h2><button onClick={() => navigator.clipboard?.writeText(pix)} className="mt-3 w-full rounded-2xl bg-white p-3 text-left font-mono text-[10px] break-all text-slate-600 ring-1 ring-slate-200">{pix}</button><button onClick={() => setPix(null)} className="press mt-3 h-11 w-full rounded-2xl bg-[#0b2be3] text-sm font-bold text-white">Fechar</button></div>}
        </div>
      </div>
    </div>
  );
}
