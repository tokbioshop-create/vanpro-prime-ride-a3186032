import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, ChevronRight, CreditCard, Loader2, LockKeyhole, QrCode } from "lucide-react";
import { brl } from "@/data/vanpro";
import { usePainel } from "@/data/painel";
import { useReserva } from "@/data/reserva";
import { criarCobranca } from "@/lib/unicopag.functions";
import carrinhoHero from "@/assets/carrinho-hero.jpg.asset.json";

export const Route = createFileRoute("/pagamentos")({
  head: () => ({
    meta: [
      { title: "Pagamento — VanMox" },
      { name: "description", content: "Finalize sua reserva VanMox com PIX ou cartão de forma segura." },
    ],
  }),
  component: Pagamentos,
});

type Metodo = "pix" | "credito" | "debito";

function PixLogo({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <g fill="#32BCAD">
        <path d="M20 3.5c2.1 0 4.1.9 5.6 2.4l8.5 8.5c1.5 1.5 1.5 4 0 5.5l-8.5 8.5a7.9 7.9 0 0 1-11.2 0l-8.5-8.5a3.9 3.9 0 0 1 0-5.5l8.5-8.5A7.9 7.9 0 0 1 20 3.5Z" />
        <path fill="white" d="m13.8 14.2 3.3-3.3a4.1 4.1 0 0 1 5.8 0l3.1 3.1-2.2 2.2-2.7-2.7a1.6 1.6 0 0 0-2.2 0l-2.9 2.9-2.2-2.2Zm12.4 11.6-3.3 3.3a4.1 4.1 0 0 1-5.8 0L14 26l2.2-2.2 2.7 2.7a1.6 1.6 0 0 0 2.2 0l2.9-2.9 2.2 2.2Z" />
      </g>
    </svg>
  );
}

function CardBrands() {
  return (
    <div className="flex items-center gap-1.5" aria-label="Visa e Mastercard">
      <span className="text-[18px] font-black italic tracking-[-0.08em] text-[#1434CB]">VISA</span>
      <span className="relative inline-block size-6" aria-hidden="true">
        <span className="absolute left-0 top-0 size-6 rounded-full bg-[#EB001B]" />
        <span className="absolute right-0 top-0 size-6 rounded-full bg-[#F79E1B] mix-blend-multiply" />
      </span>
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
    `press flex min-h-[72px] w-full items-center gap-4 rounded-[22px] border bg-white px-5 text-left shadow-[0_5px_18px_rgba(2,12,66,0.05)] transition ${
      selected ? "border-[#16a085] ring-1 ring-[#16a085]" : "border-slate-100"
    }`;

  return (
    <div className="min-h-screen bg-white text-[#071342]">
      <div className="mx-auto w-full max-w-md overflow-hidden bg-white pb-8">
        <header className="relative h-[255px] overflow-hidden bg-[#06113b]">
          <img src={carrinhoHero.url} alt="VanMox — sua viagem" className="absolute inset-0 h-full w-full object-cover object-top" />
          <div className="absolute left-3 top-3 z-20">
            <button onClick={() => navigate({ to: "/carrinho" })} aria-label="Voltar ao carrinho" className="press flex size-10 items-center justify-center rounded-full bg-white/90 text-[#071342] shadow-lg backdrop-blur-sm ring-1 ring-white/60">
              <ArrowLeft className="size-5" />
            </button>
          </div>
        </header>

        <main className="relative px-4">
          <section className="relative z-10 -mt-4 rounded-[25px] bg-white px-5 pb-5 pt-4 shadow-[0_10px_28px_rgba(2,12,66,0.12)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total da corrida</p>
                <p className="mt-0.5 text-[34px] font-black leading-none tracking-tight text-[#0b2be3]">
                  <span className="mr-1 text-[21px] text-[#071342]">R$</span>{brl(valor).replace("R$", "").trim()}
                </p>
              </div>
              <div className="mt-0.5 flex size-[76px] items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
                <img src={carrinhoHero.url} alt="Veículo da viagem" className="h-full w-full scale-[2.3] object-cover object-[72%_58%]" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-[1.25fr_.75fr_.75fr] gap-3 text-[10px] text-[#071342]">
              <div className="min-w-0">
                <span className="block font-bold truncate">⌾ {reserva.origem}</span>
                <span className="mt-1 block truncate pl-4 text-[9px] font-medium">→ {reserva.destino}</span>
              </div>
              <div className="border-l border-slate-200 pl-3"><span className="block text-slate-400">Horário</span><strong className="mt-1 block text-xs">{reserva.horario}</strong></div>
              <div className="border-l border-slate-200 pl-3"><span className="block text-slate-400">Passageiro</span><strong className="mt-1 block text-xs">{reserva.passageiros}</strong></div>
            </div>
          </section>

          <section className="mt-5">
            <h2 className="text-[17px] font-extrabold tracking-tight">Forma de pagamento</h2>
            <div className="mt-3 space-y-2.5">
              <button onClick={() => { setMetodo("pix"); setErro(null); }} className={optionClass(metodo === "pix")}>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e9fbf8]"><PixLogo className="size-8" /></div>
                <div className="min-w-0 flex-1"><p className="text-[15px] font-extrabold">Pix</p><p className="mt-0.5 text-[11px] font-medium text-[#16a085]">Aprovação imediata</p></div>
                {metodo === "pix" ? <span className="flex size-7 items-center justify-center rounded-full bg-[#159b55] text-white">✓</span> : <ChevronRight className="size-5 text-slate-400" />}
              </button>

              <button onClick={() => { setMetodo("credito"); setErro(null); }} className={optionClass(metodo === "credito")}>
                <div className="flex w-[82px] shrink-0 items-center justify-start"><CardBrands /></div>
                <div className="min-w-0 flex-1"><p className="text-[14px] font-extrabold">Cartão de Crédito</p><p className="mt-0.5 text-[11px] text-slate-500">Pague com cartão</p></div>
                <ChevronRight className="size-5 shrink-0 text-[#071342]" />
              </button>

              <button onClick={() => { setMetodo("debito"); setErro(null); }} className={optionClass(metodo === "debito")}>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#1264d8]"><CreditCard className="size-6" /></div>
                <div className="min-w-0 flex-1"><p className="text-[14px] font-extrabold">Cartão de Débito</p><p className="mt-0.5 text-[11px] text-slate-500">Pague com cartão</p></div>
                <ChevronRight className="size-5 shrink-0 text-[#071342]" />
              </button>
            </div>
          </section>

          {metodo !== "pix" && (
            <section className="mt-3 rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_5px_18px_rgba(2,12,66,0.05)]">
              <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-extrabold">Dados do cartão</h3><CardBrands /></div>
              <div className="space-y-2.5">
                <input inputMode="numeric" autoComplete="cc-number" placeholder="Número do cartão" value={cartao.numero} onChange={e => setCartao(c => ({ ...c, numero: e.target.value.replace(/\D/g, "").slice(0, 19) }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0b2be3] focus:bg-white" />
                <input autoComplete="cc-name" placeholder="Nome impresso no cartão" value={cartao.titular} onChange={e => setCartao(c => ({ ...c, titular: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0b2be3] focus:bg-white" />
                <div className="flex gap-2.5"><input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={cartao.validade} onChange={e => setCartao(c => ({ ...c, validade: e.target.value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2") }))} className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0b2be3] focus:bg-white" /><input inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" value={cartao.cvv} onChange={e => setCartao(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0b2be3] focus:bg-white" /></div>
                {metodo === "credito" && <select value={cartao.parcelas} onChange={e => setCartao(c => ({ ...c, parcelas: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0b2be3]"><option value={1}>1x de {brl(valor)}</option>{Array.from({ length: 11 }, (_, i) => i + 2).map(n => <option key={n} value={n}>{n}x de {brl(valor / n)}</option>)}</select>}
              </div>
            </section>
          )}

          {metodo === "pix" && (
            <div className="mt-3 rounded-[18px] border border-[#32BCAD]/15 bg-[#f1fcfa] px-4 py-3 text-[11px] leading-relaxed text-slate-600">
              O código Pix será gerado ao tocar em <strong className="text-[#071342]">Pagar agora</strong>.
            </div>
          )}

          {erro && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 ring-1 ring-red-100">{erro}</p>}

          <div className="mt-4 flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-[10px] font-medium text-slate-500">
            <LockKeyhole className="size-4 text-[#071342]" />
            <span>Seus dados protegidos com criptografia SSL</span>
          </div>

          <button onClick={pagar} disabled={carregando} className="press mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b2be3] text-base font-extrabold text-white shadow-[0_10px_28px_rgba(11,43,227,0.24)]">
            {carregando ? <Loader2 className="size-5 animate-spin" /> : `Pagar agora · ${brl(valor)}`}
          </button>

          {pix && <div className="mt-4 rounded-[22px] border border-slate-200 bg-white p-4 shadow-lg"><h2 className="text-sm font-extrabold">PIX copia e cola</h2><button onClick={() => navigator.clipboard?.writeText(pix)} className="mt-3 w-full rounded-xl bg-slate-50 p-3 text-left font-mono text-[10px] break-all text-slate-600 ring-1 ring-slate-200">{pix}</button><button onClick={() => setPix(null)} className="press mt-3 h-11 w-full rounded-xl bg-[#071342] text-sm font-bold text-white">Fechar</button></div>}
        </main>
      </div>
    </div>
  );
}
