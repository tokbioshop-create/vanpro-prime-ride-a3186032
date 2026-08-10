import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import carrinhoHero from "@/assets/carrinho-hero.jpg.asset.json";
import { Campo } from "@/components/Campo";
import { useReserva } from "@/data/reserva";
import { brl } from "@/data/vanpro";

export const Route = createFileRoute("/carrinho")({
  head: () => ({ meta: [{ title: "Seu carrinho — VanPro" }, { name: "description", content: "Confira os detalhes da sua viagem, o valor da corrida e siga para o pagamento seguro." }, { property: "og:title", content: "Seu carrinho — VanPro" }, { property: "og:description", content: "Resumo da viagem e valor antes do pagamento." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Carrinho,
});

const BRANCO = "#f8f8f8";
const NAVY = "#020c42";

function Hotspot({ label, left, top, width, height, onClick }: { label: string; left: number; top: number; width: number; height: number; onClick: () => void }) {
  return <button type="button" aria-label={label} onClick={onClick} className="press absolute rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }} />;
}

function Carrinho() {
  const navigate = useNavigate();
  const r = useReserva();
  return (
    <div className="min-h-screen bg-[oklch(0.14_0.06_268)]">
      <div className="relative mx-auto w-full max-w-md" style={{ containerType: "inline-size" }}>
        <button type="button" onClick={() => navigate({ to: "/agendar" })} aria-label="Voltar" className="press absolute top-3 left-3 z-10 flex size-10 items-center justify-center rounded-full bg-[oklch(1_0_0/0.16)] text-primary-foreground backdrop-blur-sm ring-1 ring-[oklch(1_0_0/0.25)]"><ChevronLeft className="size-5" /></button>
        <img src={carrinhoHero.url} alt={`Seu carrinho VanPro: viagem de ${r.origem} para ${r.destino}, total ${brl(r.total)}`} className="block w-full select-none" />
        <Campo left={47.5} top={14.4} width={49} height={7.6} bg={NAVY}><span className="font-bold text-white" style={{ fontSize: "4.2cqw", lineHeight: 1.25 }}>{r.origem}</span><span className="font-bold text-white" style={{ fontSize: "4.2cqw", lineHeight: 1.25 }}>→ {r.destino}</span></Campo>
        <Campo left={48.6} top={22.6} width={11} height={2.5} bg={NAVY}><span className="font-bold text-white" style={{ fontSize: "3.3cqw" }}>{r.horario}</span></Campo>
        <Campo left={66} top={22.6} width={9} height={2.5} bg={NAVY}><span className="font-bold text-white" style={{ fontSize: "3.3cqw" }}>{r.assentos}</span></Campo>
        <Campo left={83.4} top={22.6} width={7} height={2.5} bg={NAVY}><span className="font-bold text-white" style={{ fontSize: "3.3cqw" }}>{r.passageiros}</span></Campo>
        <Campo left={18.6} top={39.2} width={55} height={2.8} bg={BRANCO}><span style={{ fontSize: "3.4cqw", color: "#5b6070" }}>{r.nome}</span></Campo>
        <Campo left={18.6} top={46} width={55} height={2.8} bg={BRANCO}><span style={{ fontSize: "3.4cqw", color: "#5b6070" }}>{r.data}</span></Campo>
        <Campo left={18.6} top={54.6} width={62} height={3.4} bg={BRANCO}><span style={{ fontSize: "3.4cqw", color: "#5b6070" }}>{r.observacao}</span></Campo>
        <Campo left={6.5} top={66.2} width={45} height={2.9} bg={BRANCO}><span style={{ fontSize: "3.5cqw", color: "#2b2f3d" }}>{r.veiculo}</span></Campo>
        <Campo left={58} top={66.2} width={35} height={2.9} bg={BRANCO} align="right"><span className="font-semibold" style={{ fontSize: "3.5cqw", color: "#14152f" }}>{brl(r.subtotal)}</span></Campo>
        <Campo left={58} top={71.6} width={35} height={2.9} bg={BRANCO} align="right"><span className="font-semibold" style={{ fontSize: "3.5cqw", color: "#14152f" }}>{brl(r.taxa)}</span></Campo>
        <Campo left={54} top={75.9} width={39} height={4.2} bg={BRANCO} align="right"><span className="font-extrabold" style={{ fontSize: "5.4cqw", color: "#0b2be3" }}>{brl(r.total)}</span></Campo>
        <Hotspot label="Alterar viagem" left={74} top={12.2} width={20} height={4.2} onClick={() => navigate({ to: "/agendar" })} />
        <Hotspot label="Adicionar cupom de desconto" left={4} top={83} width={92} height={7.4} onClick={() => navigate({ to: "/agendar" })} />
        <button type="button" onClick={() => navigate({ to: "/pagamentos" })} className="press absolute left-[4%] top-[91.5%] z-20 flex h-[7.6%] w-[92%] items-center justify-center gap-2.5 rounded-[22px] bg-[#0b2be3] px-4 text-white shadow-[0_10px_28px_rgba(11,43,227,0.28)] ring-1 ring-white/30"><ShieldCheck className="size-5 shrink-0" /><span className="text-[3.7cqw] font-extrabold">Continuar para pagamento</span><LockKeyhole className="size-4 shrink-0 opacity-90" /></button>
      </div>
    </div>
  );
}
