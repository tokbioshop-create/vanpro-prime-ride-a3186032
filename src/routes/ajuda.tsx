import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Phone, Mail, ChevronDown, Instagram, Facebook, Music2 } from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { usePainel } from "@/data/painel";
import { whatsappLink } from "@/data/vanpro";


export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Central de ajuda — VanPro" },
      {
        name: "description",
        content: "Tire dúvidas sobre reservas, pagamentos e embarque ou fale com o suporte VanPro.",
      },
      { property: "og:title", content: "Central de ajuda — VanPro" },
      { property: "og:description", content: "Suporte VanPro 24h para passageiros." },
    ],
  }),
  component: Ajuda,
});

const faqs = [
  {
    q: "Como confirmo minha reserva?",
    a: "A reserva é confirmada automaticamente assim que o pagamento é aprovado. O comprovante é gerado na hora e fica salvo em Minhas reservas.",
  },
  {
    q: "Posso cancelar uma viagem?",
    a: "Sim. Cancelamentos feitos com mais de 24h de antecedência têm reembolso integral no mesmo meio de pagamento.",
  },
  {
    q: "Como falo com o motorista?",
    a: "Em Viagens agendadas, toque em “Falar com o motorista” para abrir a conversa direto no WhatsApp.",
  },
  {
    q: "Como escolho meu assento?",
    a: "Durante o agendamento você visualiza o mapa do veículo e seleciona os assentos livres conforme o número de passageiros.",
  },
];

function Ajuda() {
  const [aberta, setAberta] = useState<number | null>(0);
  const { config } = usePainel();
  const c = config.contatos;
  const redes = [
    { label: "Instagram", valor: c.instagram, icon: Instagram },
    { label: "Facebook", valor: c.facebook, icon: Facebook },
    { label: "TikTok", valor: c.tiktok, icon: Music2 },
  ];

  return (
    <AppScreen title="Central de ajuda" subtitle="Suporte disponível 24h">
      <div className="grid grid-cols-3 gap-3">
        <a
          href={whatsappLink(c.whatsapp, "Olá, preciso de ajuda no VanPro.")}
          target="_blank"
          rel="noopener noreferrer"
          className="press card-elevated flex flex-col items-center gap-2 py-4"
        >
          <MessageCircle className="size-5 text-success" />
          <span className="text-[11px] font-semibold">WhatsApp</span>
        </a>
        <a
          href={`tel:${c.telefone.replace(/\D/g, "")}`}
          className="press card-elevated flex flex-col items-center gap-2 py-4"
        >
          <Phone className="size-5 text-primary" />
          <span className="text-[11px] font-semibold">Telefone</span>
        </a>
        <a
          href={`mailto:${c.email}`}
          className="press card-elevated flex flex-col items-center gap-2 py-4"
        >
          <Mail className="size-5 text-accent" />
          <span className="text-[11px] font-semibold">E-mail</span>
        </a>
      </div>

      <h2 className="mt-7 mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Redes sociais
      </h2>
      <div className="card-elevated divide-y divide-transparent">
        {redes.map(({ label, valor, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 p-4">
            <Icon className="size-4.5 text-primary" />
            <span className="flex-1 text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold">{valor}</span>
          </div>
        ))}
      </div>


      <h2 className="mt-7 mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Perguntas frequentes
      </h2>
      <div className="space-y-2.5">
        {faqs.map((f, i) => (
          <div key={f.q} className="card-elevated overflow-hidden">
            <button
              onClick={() => setAberta(aberta === i ? null : i)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span className="flex-1 text-sm font-semibold">{f.q}</span>
              <ChevronDown
                className={`size-4.5 text-muted-foreground transition-transform ${aberta === i ? "rotate-180" : ""}`}
              />
            </button>
            {aberta === i && (
              <p className="animate-rise px-4 pb-4 text-xs leading-relaxed text-muted-foreground">
                {f.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </AppScreen>
  );
}
