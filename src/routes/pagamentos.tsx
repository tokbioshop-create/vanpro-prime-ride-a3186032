import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, LockKeyhole, QrCode, ShieldCheck, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-[oklch(0.12_0.05_268)] px-5 py-8 text-white">
      <div className="mx-auto flex min-h-[82vh] max-w-md flex-col items-center justify-center text-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-emerald-400/10 ring-1 ring-emerald-300/20"><CheckCircle2 className="size-14 text-emerald-300" /></div>
        <p className="mt-6 text-[10px] font-black tracking-[0.24em] text-gold uppercase">VanPro · Pagamento aprovado</p>
        <h1 className="mt-2 text-3xl font-black">Reserva confirmada!</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">Pagamento de {brl(valor)} aprovado com sucesso. Sua viagem está confirmada.</p>
        <button onClick={() => navigate({ to: "/reservas" })} className="press mt-8 h-14 w-full rounded-2xl bg-gold font-extrabold text-navy shadow-[var(--shadow-gold)]">Ver minhas reservas</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[oklch(0.12_0.05_268)] text-white">
      <div className="mx-auto min-h-screen max-w-md pb-10">
        <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[oklch(0.12_0.05_268)/0.94] px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: "/carrinho" })} aria-label="Voltar ao carrinho" className="press flex size-10 items-center justify-center rounded-full bg-white/[0.07] ring-1 ring-white/10"><ArrowLeft className="size-5" /></button>
            <div className="min-w-0 flex-1"><p className="text-[9px] font-black tracking-[0.22em] text-gold uppercase">VanPro</p><h1 className="text-lg font-extrabold">Pagamento</h1></div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-300/15"><LockKeyhole className="size-3.5" /> Seguro</div>
          </div>
        </header>

        <section className="relative mx-5 mt-4 overflow-hidden rounded-[28px] border border-gold/20 bg-gradient-to-br from-gold/[0.14] via-white/[0.06] to-white/[0.03] p-5 shadow-2xl">
          <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.18em] text-gold uppercase"><Sparkles className="size-3.5" /> Sua viagem está quase confirmada</div>
            <div className="mt-4 flex items-end justify-between gap-4"><div><p className="text-[11px] text-white/45">Total a pagar</p><p className="mt-1 text-3xl font-black tracking-tight text-white">{brl(valor)}</p></div><div className="flex size-14 items-center justify-center rounded-2xl bg-gold text-navy shadow-[var(--shadow-gold)]"><ShieldCheck className="size-7" /></div></div>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-black/20 p-3"><span className="text-[9px] font-bold tracking-wide text-white/40 uppercase">De</span><strong className="mt-1 block truncate text-xs">{reserva.origem}</strong></div>
              <div className="rounded-2xl bg-black/20 p-3"><span className="text-[9px] font-bold tracking-wide text-white/40 uppercase">Para</span><strong className="mt-1 block truncate text-xs">{reserva.destino}</strong></div>
              <div className="rounded-2xl bg-black/20 p-3"><span className="text-[9px] font-bold tracking-wide text-white/40 uppercase">Horário</span><strong className="mt-1 block text-xs">{reserva.horario}</strong></div>
              <div className="rounded-2xl bg-black/20 p-3"><span className="text-[9px] font-bold tracking-wide text-white/40 uppercase">Passageiros</span><strong className="mt-1 block text-xs">{reserva.passageiros}</strong></div>
            </div>
          </div>
        </section>

        <section className="mx-5 mt-5">
          <div className="flex items-end justify-between"><div><p className="text-[10px] font-bold tracking-[0.16em] text-white/40 uppercase">Etapa final</p><h2 className="mt-1 text-base font-extrabold">Como você quer pagar?</h2></div><div className="flex items-center gap-1 text-[10px] text-white/45"><LockKeyhole className="size-3.5" /> Ambiente protegido</div></div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {([['pix', QrCode, 'PIX'], ['credito', CreditCard, 'Crédito'], ['debito', CreditCard, 'Débito']] as const).map(([id, Icon, label]) => <button key={id} onClick={() => { setMetodo(id); setErro(null); }} className={`press rounded-2xl p-3 ring-1 transition-all ${metodo === id ? 'bg-gold text-navy ring-gold shadow-[var(--shadow-gold)]' : 'bg-white/[0.055] text-white ring-white/10'}`}><Icon className="mx-auto size-5" /><span className="mt-1.5 block text-[11px] font-extrabold">{label}</span></button>)}
          </div>
        </section>

        {metodo !== 'pix' && <section className="mx-5 mt-4 rounded-[26px] border border-white/10 bg-white/[0.045] p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-extrabold">Dados do cartão</h3><div className="flex gap-1.5"><span className="rounded-md bg-white px-2 py-1 text-[8px] font-black text-[#1434CB]">VISA</span><span className="rounded-md bg-white px-1.5 py-1 text-[8px] font-black text-[#EB001B]">●●</span></div></div>
          <div className="space-y-3">
            <input inputMode="numeric" autoComplete="cc-number" placeholder="Número do cartão" value={cartao.numero} onChange={e => setCartao(c => ({ ...c, numero: e.target.value.replace(/\D/g, '').slice(0, 19) }))} className="w-full rounded-2xl bg-black/25 px-4 py-3.5 text-sm outline-none ring-1 ring-white/10 focus:ring-gold" />
            <input autoComplete="cc-name" placeholder="Nome impresso no cartão" value={cartao.titular} onChange={e => setCartao(c => ({ ...c, titular: e.target.value }))} className="w-full rounded-2xl bg-black/25 px-4 py-3.5 text-sm outline-none ring-1 ring-white/10 focus:ring-gold" />
            <div className="flex gap-3"><input inputMode="numeric" autoComplete="cc-exp" placeholder="Validade  MM/AA" value={cartao.validade} onChange={e => setCartao(c => ({ ...c, validade: e.target.value.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2') }))} className="w-1/2 rounded-2xl bg-black/25 px-4 py-3.5 text-sm outline-none ring-1 ring-white/10 focus:ring-gold" /><input inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" value={cartao.cvv} onChange={e => setCartao(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} className="w-1/2 rounded-2xl bg-black/25 px-4 py-3.5 text-sm outline-none ring-1 ring-white/10 focus:ring-gold" /></div>
            {metodo === 'credito' && <select value={cartao.parcelas} onChange={e => setCartao(c => ({ ...c, parcelas: Number(e.target.value) }))} className="w-full rounded-2xl bg-black/25 px-4 py-3.5 text-sm outline-none ring-1 ring-white/10"><option value={1}>1x de {brl(valor)}</option>{Array.from({ length: 11 }, (_, i) => i + 2).map(n => <option key={n} value={n}>{n}x de {brl(valor / n)}</option>)}</select>}
          </div>
        </section>}

        {metodo === 'pix' && <section className="mx-5 mt-4 rounded-[26px] border border-gold/15 bg-gold/[0.07] p-4 ring-1 ring-gold/10"><div className="flex gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold text-navy"><QrCode className="size-6" /></div><div><h3 className="text-sm font-extrabold">Pagamento instantâneo via PIX</h3><p className="mt-1 text-xs leading-relaxed text-white/55">Depois de continuar, você receberá o código PIX para copiar e pagar no aplicativo do seu banco.</p></div></div></section>}

        {erro && <p className="mx-5 mt-4 rounded-2xl bg-red-500/10 p-3 text-xs font-semibold text-red-300 ring-1 ring-red-500/20">{erro}</p>}

        <div className="mx-5 mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-3"><div className="flex items-center gap-2"><LockKeyhole className="size-4 text-emerald-300" /><span className="text-[11px] font-bold">Compra protegida</span></div><p className="mt-1 pl-6 text-[10px] leading-relaxed text-white/40">Seus dados de cartão não são armazenados pelo VanPro. O pagamento é processado pelo serviço financeiro integrado.</p></div>

        <button onClick={pagar} disabled={carregando} className="press mx-5 mt-4 flex h-15 w-[calc(100%-2.5rem)] items-center justify-center gap-2 rounded-2xl bg-gold text-base font-black text-navy shadow-[var(--shadow-gold)]">{carregando ? <Loader2 className="size-5 animate-spin" /> : `Confirmar e pagar ${brl(valor)}`}</button>
        <div className="mx-5 mt-4 flex items-center justify-center gap-4 text-[9px] font-bold text-white/35"><span className="rounded-md bg-white px-2 py-1 text-[8px] font-black text-[#1434CB]">VISA</span><span className="rounded-md bg-white px-1.5 py-1 text-[8px] font-black text-[#EB001B]">●● MASTERCARD</span><span className="font-black text-[#32BCAD]">PIX</span></div>
        <p className="px-8 pt-3 text-center text-[9px] leading-relaxed text-white/30">Ao continuar, você confirma os dados da reserva e autoriza o processamento do pagamento.</p>

        {pix && <div className="mx-5 mt-5 rounded-[26px] border border-gold/20 bg-white/[0.06] p-4 ring-1 ring-white/10"><h2 className="text-sm font-extrabold">PIX copia e cola</h2><button onClick={() => navigator.clipboard?.writeText(pix)} className="mt-3 w-full rounded-2xl bg-black/25 p-3 text-left font-mono text-[10px] break-all text-white/70">{pix}</button><button onClick={() => setPix(null)} className="press mt-3 h-11 w-full rounded-2xl bg-white/10 text-sm font-bold">Fechar</button></div>}
      </div>
    </div>
  );
}
